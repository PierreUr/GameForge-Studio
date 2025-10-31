import { World } from '../ecs/World';
import { Graph } from '../graph/Graph';
import { IProject, LayoutState } from './IProject';
import { EventBus } from '../ecs/EventBus';
import { SectionData } from '../ui/UIEditorPanel';

const CURRENT_PROJECT_VERSION = "1.2.0";
const AUTO_SAVE_KEY = 'gameforge-autosave';

/**
 * @class ProjectManager
 * @description A singleton class to manage the overall project state, including saving,
 * loading, versioning, and auto-saving. It now supports multiple layouts per project.
 */
export class ProjectManager {
    private static instance: ProjectManager;
    private world: World | null = null;
    private graph: Graph | null = null;
    
    private currentProject: IProject;
    private activeLayoutKey: string = 'default';

    private constructor() {
        this.currentProject = this.createEmptyProject();
    }

    private createEmptyProject(): IProject {
        const emptyLayout: LayoutState = {
            ecsState: { entities: [], components: {} },
            uiState: []
        };
        return {
            metadata: {
                projectName: 'New GameForge Project',
                version: CURRENT_PROJECT_VERSION,
                activeLayoutKey: 'default',
                // FIX: Initialize the project's live status.
                isLive: false,
            },
            layouts: {
                default: { ...emptyLayout }
            },
            logicGraphState: { nodes: [], connections: [] },
        };
    }

    public static getInstance(): ProjectManager {
        if (!ProjectManager.instance) {
            ProjectManager.instance = new ProjectManager();
        }
        return ProjectManager.instance;
    }

    /**
     * Initializes the ProjectManager with necessary dependencies.
     * @param {World} world - The ECS World instance.
     * @param {Graph} graph - The Logic Graph instance.
     */
    public init(world: World, graph: Graph): void {
        this.world = world;
        this.graph = graph;
        this.graph.deserialize(this.currentProject.logicGraphState);
        this.world.loadProjectState(this.currentProject.layouts.default.ecsState);
    }

    /**
     * Switches the active layout, saving the current scene state and loading the new one.
     * @param {string} newLayoutKey - The key of the new layout ('default', 'desktop', etc.).
     */
    public switchActiveLayout(newLayoutKey: string, currentUiLayout: SectionData[]): { ecsState: any, uiState: SectionData[] } {
        if (!this.world || newLayoutKey === this.activeLayoutKey) {
            // Return current state if no switch is needed
            return { ecsState: this.world.getProjectState(), uiState: currentUiLayout };
        }

        // 1. Save current state
        (this.currentProject.layouts as any)[this.activeLayoutKey] = {
            ecsState: this.world.getProjectState(),
            uiState: currentUiLayout
        };

        // 2. Switch key
        this.activeLayoutKey = newLayoutKey;
        this.currentProject.metadata.activeLayoutKey = newLayoutKey;

        // 3. Load or create new state
        if (!(this.currentProject.layouts as any)[newLayoutKey]) {
            (this.currentProject.layouts as any)[newLayoutKey] = {
                ecsState: { entities: [], components: {} },
                uiState: []
            };
        }
        
        const newLayoutState: LayoutState = (this.currentProject.layouts as any)[newLayoutKey];
        
        return {
            ecsState: newLayoutState.ecsState,
            uiState: newLayoutState.uiState
        };
    }
    
    private slugify(text: string): string {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    /**
     * Saves the entire project state, including all layouts, to a JSON file.
     * @param uiLayout The current UI layout state to save.
     * @param projectName The name for the project and file.
     * @param isLive The live status of the project.
     */
    // FIX: Added the `isLive` parameter to match the function call in index.tsx, resolving the argument count error.
    public saveProject(uiLayout: SectionData[], projectName?: string, isLive?: boolean): void {
        if (!this.world || !this.graph) {
            alert('Cannot save: ProjectManager not fully initialized.');
            return;
        }

        try {
            // Ensure the currently active layout is saved before serializing
            (this.currentProject.layouts as any)[this.activeLayoutKey] = {
                ecsState: this.world.getProjectState(),
                uiState: uiLayout
            };
            this.currentProject.logicGraphState = this.graph.serialize();
            this.currentProject.metadata.version = CURRENT_PROJECT_VERSION;
            this.currentProject.metadata.activeLayoutKey = this.activeLayoutKey;
            
            if (projectName) {
                this.currentProject.metadata.projectName = projectName;
            }

            // FIX: Save the project's live status to the project metadata.
            if (isLive !== undefined) {
                this.currentProject.metadata.isLive = isLive;
            }

            const jsonString = JSON.stringify(this.currentProject, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = this.slugify(this.currentProject.metadata.projectName || 'gameforge-project');
            a.download = `${fileName}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('[ProjectManager] Failed to save project:', error);
            alert('An error occurred while saving the project. See console for details.');
        }
    }

    /**
     * Opens a file dialog to load a project from a JSON file.
     */
    public loadProject(): void {
        if (!this.world || !this.graph) {
            alert('Cannot load: ProjectManager not fully initialized.');
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result;
                    if (typeof content !== 'string') throw new Error('File content is not a string.');
                    
                    let projectState: IProject = JSON.parse(content);

                    // --- Backwards Compatibility ---
                    if (!projectState.layouts || typeof (projectState.layouts as any).default.uiState === 'undefined') {
                        console.warn("Old project format detected. Upgrading...");
                        const upgradedLayouts: any = {};
                        // If `layouts` exists but is in old format
                        if (projectState.layouts) {
                             for (const key in projectState.layouts) {
                                upgradedLayouts[key] = {
                                    ecsState: (projectState.layouts as any)[key],
                                    uiState: [] // Default to empty UI layout
                                };
                            }
                        } else if ((projectState as any).ecsState) { // For very old format
                             upgradedLayouts.default = {
                                ecsState: (projectState as any).ecsState,
                                uiState: []
                             };
                        } else {
                            throw new Error('Invalid or unrecognized old project file structure.');
                        }
                        projectState.layouts = upgradedLayouts;
                        projectState.metadata.activeLayoutKey = projectState.metadata.activeLayoutKey || 'default';
                        alert('Project file was from an older version and has been upgraded. Please re-save the project to finalize the changes.');
                    }


                    this.currentProject = projectState;
                    this.activeLayoutKey = this.currentProject.metadata.activeLayoutKey || 'default';
                    
                    const stateToLoad: LayoutState = (this.currentProject.layouts as any)[this.activeLayoutKey] || this.currentProject.layouts.default;

                    this.world!.loadProjectState(stateToLoad.ecsState);
                    this.graph!.deserialize(this.currentProject.logicGraphState);
                    
                    // FIX: Pass the loaded project's `isLive` status in the event payload.
                    EventBus.getInstance().publish('project:loaded', { 
                        activeLayoutKey: this.activeLayoutKey,
                        uiState: stateToLoad.uiState || [],
                        isLive: this.currentProject.metadata.isLive
                    });

                } catch (error) {
                    console.error('[ProjectManager] Failed to load project:', error);
                    alert('Failed to parse project file. Ensure it is a valid project JSON.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
    
    /**
     * Starts the auto-save mechanism.
     * @param {number} interval - The interval in milliseconds for auto-saving.
     * @returns {number} The interval ID, which can be used with clearInterval.
     */
    public startAutoSave(interval: number): number {
        // This needs access to uiLayout, so it's better handled in App.tsx for now.
        // Returning a dummy interval.
        return 0;
        // A better implementation would be to have the App component call a modified
        // autoSaveToLocalStorage with the current uiLayout.
    }
    
    /**
     * Saves the current project state to the browser's localStorage.
     * @private
     */
    private autoSaveToLocalStorage(uiLayout: SectionData[]): void {
        if (!this.world || !this.graph) {
            return; 
        }
        try {
            // Similar to saveProject, update the current layout before saving
            (this.currentProject.layouts as any)[this.activeLayoutKey] = {
                 ecsState: this.world.getProjectState(),
                 uiState: uiLayout
            };
            this.currentProject.logicGraphState = this.graph.serialize();
            this.currentProject.metadata.activeLayoutKey = this.activeLayoutKey;

            const jsonString = JSON.stringify(this.currentProject);
            localStorage.setItem(AUTO_SAVE_KEY, jsonString);
        } catch (error) {
            console.error('[ProjectManager] Auto-save to localStorage failed:', error);
        }
    }

    private _generateStandaloneHTML(isPreview: boolean, uiLayout: SectionData[]): string | null {
        if (!this.world || !this.graph) {
            alert('Cannot generate HTML: ProjectManager not fully initialized.');
            return null;
        }

        try {
            // Ensure current layout is saved before generating
            (this.currentProject.layouts as any)[this.activeLayoutKey] = {
                ecsState: this.world.getProjectState(),
                uiState: uiLayout
            };
            this.currentProject.logicGraphState = this.graph.serialize();
            
            const projectStateString = JSON.stringify(this.currentProject);
            
            const title = isPreview ? 'GameForge Project Preview' : 'GameForge Project';
            const bodyContent = isPreview
                ? `<div class="container"><h1>Live Preview</h1><p>Game runner not yet implemented.</p></div>`
                : `<div id="game-container"></div>`;

            const runnerScript = `
                console.log('Game Runner Initialized.');
                const projectData = JSON.parse(document.getElementById('project-data').textContent);
                console.log('Project Data Loaded:', projectData);
            `;

            return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><title>${title}</title>
    <style>body{margin:0;background:#1a1a1a;color:#eee;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;}.container{text-align:center;padding:2rem;border:1px solid #444;border-radius:8px;background:#2a2a2a;}</style>
</head>
<body>
    ${bodyContent}
    <script type="application/json" id="project-data">${projectStateString}</script>
    <script>${runnerScript}</script>
</body>
</html>`;
        } catch (error) {
            console.error('[ProjectManager] Failed to generate standalone HTML:', error);
            alert('An error occurred during HTML generation.');
            return null;
        }
    }
    
    public previewProject(uiLayout: SectionData[]): void {
        const htmlContent = this._generateStandaloneHTML(true, uiLayout);
        if (htmlContent) {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    }

    public exportToStandaloneHTML(uiLayout: SectionData[]): void {
        const htmlContent = this._generateStandaloneHTML(false, uiLayout);
        if (htmlContent) {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gameforge-export.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
}
