import { World } from '../ecs/World';
import { Graph } from '../graph/Graph';
import { IProject } from './IProject';

const CURRENT_PROJECT_VERSION = "1.2.0";
const AUTO_SAVE_KEY = 'gameforge-autosave';

/**
 * @class ProjectManager
 * @description A singleton class to manage the overall project state, including saving,
 * loading, versioning, and auto-saving.
 */
export class ProjectManager {
    private static instance: ProjectManager;
    private world: World | null = null;
    private graph: Graph | null = null;

    private constructor() {
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
    }

    /**
     * Saves the entire project state to a JSON file and triggers a download.
     */
    public saveProject(): void {
        if (!this.world || !this.graph) {
            alert('Cannot save: ProjectManager not fully initialized.');
            return;
        }

        try {
            const project: IProject = {
                metadata: {
                    projectName: 'GameForge Project',
                    version: CURRENT_PROJECT_VERSION,
                },
                ecsState: this.world.getProjectState(),
                logicGraphState: this.graph.serialize(),
            };

            const jsonString = JSON.stringify(project, null, 2);
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

                    // Version Check
                    if (projectState.metadata?.version !== CURRENT_PROJECT_VERSION) {
                        alert(`Warning: This project was saved with a different version (${projectState.metadata?.version || 'unknown'}). The current version is ${CURRENT_PROJECT_VERSION}. Some data may not load correctly.`);
                    }

                    if (!projectState.ecsState || !projectState.logicGraphState) {
                        throw new Error('Invalid project file structure.');
                    }

                    this.world!.loadProjectState(projectState.ecsState);
                    this.graph!.deserialize(projectState.logicGraphState);

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
            return; // Not ready to save yet
        }
        try {
            const project: IProject = {
                metadata: {
                    projectName: 'Auto-Save',
                    version: CURRENT_PROJECT_VERSION,
                },
                ecsState: this.world.getProjectState(),
                logicGraphState: this.graph.serialize(),
            };
            const jsonString = JSON.stringify(project);
            localStorage.setItem(AUTO_SAVE_KEY, jsonString);
        } catch (error) {
            console.error('[ProjectManager] Auto-save to localStorage failed:', error);
        }
    }

    /**
     * Exports the current project as a standalone HTML file.
     */
    public exportToStandaloneHTML(): void {
        if (!this.world || !this.graph) {
            alert('Cannot export: ProjectManager not fully initialized.');
            return;
        }

        try {
            const projectState: IProject = {
                metadata: {
                    projectName: 'GameForge Export',
                    version: CURRENT_PROJECT_VERSION,
                },
                ecsState: this.world.getProjectState(),
                logicGraphState: this.graph.serialize(),
            };
            const projectStateString = JSON.stringify(projectState);

            // This is a simplified HTML template. A real implementation would need a full game runner.
            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>GameForge Project</title>
    <style>body { margin: 0; background-color: #000; }</style>
</head>
<body>
    <div id="game-container"></div>
    <script type="application/json" id="project-data">
        ${projectStateString}
    </script>
    <script>
        // Placeholder for a lightweight game runner engine
        console.log('Game Runner Initialized.');
        const projectDataElement = document.getElementById('project-data');
        if (projectDataElement) {
            const projectData = JSON.parse(projectDataElement.textContent || '{}');
            console.log('Project Data Loaded:', projectData);
            // Here, the game runner would deserialize the project and start the game loop.
            alert('Project data loaded! Check the console. Game execution is not yet implemented.');
        } else {
            console.error('Project data not found!');
        }
    </script>
</body>
</html>`;

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gameforge-export.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('[ProjectManager] Failed to export project to HTML:', error);
            alert('An error occurred during HTML export. See console for details.');
        }
    }
}