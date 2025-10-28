import { World } from '../ecs/World';
import { Graph } from '../graph/Graph';
import { IProject } from './IProject';
import { EventBus } from '../ecs/EventBus';

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
        return {
            metadata: {
                projectName: 'New GameForge Project',
                version: CURRENT_PROJECT_VERSION,
                activeLayoutKey: 'default',
            },
            layouts: {
                default: { entities: [], components: {} }
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
        this.world.loadProjectState(this.currentProject.layouts.default);
    }

    /**
     * Switches the active layout, saving the current scene state and loading the new one.
     * @param {string} newLayoutKey - The key of the new layout ('default', 'desktop', etc.).
     */
    public switchActiveLayout(newLayoutKey: string): void {
        if (!this.world || newLayoutKey === this.activeLayoutKey) {
            return;
        }

        const currentEcsState = this.world.getProjectState();
        (this.currentProject.layouts as any)[this.activeLayoutKey] = currentEcsState;

        this.activeLayoutKey = newLayoutKey;
        this.currentProject.metadata.activeLayoutKey = newLayoutKey;

        const newEcsState = (this.currentProject.layouts as any)[newLayoutKey] || { entities: [], components: {} };
        this.world.loadProjectState(newEcsState);
    }

    /**
     * Saves the entire project state, including all layouts, to a JSON file.
     */
    public saveProject(): void {
        if (!this.world || !this.graph) {
            alert('Cannot save: ProjectManager not fully initialized.');
            return;
        }

        try {
            // Ensure the currently active layout is saved before serializing
            (this.currentProject.layouts as any)[this.activeLayoutKey] = this.world.getProjectState();
            this.currentProject.logicGraphState = this.graph.serialize();
            this.currentProject.metadata.version = CURRENT_PROJECT_VERSION;
            this.currentProject.metadata.activeLayoutKey = this.activeLayoutKey;

            const jsonString = JSON.stringify(this.currentProject, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gameforge-project.json';
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
                    
                    const projectState: IProject = JSON.parse(content);

                    if (projectState.metadata?.version !== CURRENT_PROJECT_VERSION) {
                        alert(`Warning: Project version (${projectState.metadata?.version}) differs from current version (${CURRENT_PROJECT_VERSION}).`);
                    }

                    if (!projectState.layouts || !projectState.logicGraphState) {
                        // Backwards compatibility for old format
                        if ((projectState as any).ecsState) {
                            projectState.layouts = { default: (projectState as any).ecsState };
                            projectState.metadata.activeLayoutKey = 'default';
                        } else {
                            throw new Error('Invalid project file structure.');
                        }
                    }

                    this.currentProject = projectState;
                    this.activeLayoutKey = this.currentProject.metadata.activeLayoutKey || 'default';
                    const stateToLoad = (this.currentProject.layouts as any)[this.activeLayoutKey] || this.currentProject.layouts.default;

                    this.world!.loadProjectState(stateToLoad);
                    this.graph!.deserialize(this.currentProject.logicGraphState);
                    
                    EventBus.getInstance().publish('project:loaded', { activeLayoutKey: this.activeLayoutKey });

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
        return window.setInterval(() => this.autoSaveToLocalStorage(), interval);
    }
    
    /**
     * Saves the current project state to the browser's localStorage.
     * @private
     */
    private autoSaveToLocalStorage(): void {
        if (!this.world || !this.graph) {
            return; 
        }
        try {
            // Similar to saveProject, update the current layout before saving
            (this.currentProject.layouts as any)[this.activeLayoutKey] = this.world.getProjectState();
            this.currentProject.logicGraphState = this.graph.serialize();
            this.currentProject.metadata.activeLayoutKey = this.activeLayoutKey;

            const jsonString = JSON.stringify(this.currentProject);
            localStorage.setItem(AUTO_SAVE_KEY, jsonString);
        } catch (error) {
            console.error('[ProjectManager] Auto-save to localStorage failed:', error);
        }
    }

    private _generateStandaloneHTML(isPreview: boolean): string | null {
        if (!this.world || !this.graph) {
            alert('Cannot generate HTML: ProjectManager not fully initialized.');
            return null;
        }

        try {
            // Ensure current layout is saved before generating
            (this.currentProject.layouts as any)[this.activeLayoutKey] = this.world.getProjectState();
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
    
    public previewProject(): void {
        const htmlContent = this._generateStandaloneHTML(true);
        if (htmlContent) {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    }

    public exportToStandaloneHTML(): void {
        const htmlContent = this._generateStandaloneHTML(false);
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