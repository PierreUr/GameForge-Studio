import { SectionData } from "../ui/UIEditorPanel";
import { FrameConfig } from "../rendering/Renderer";


/**
 * @interface IProjectMetadata
 * @description Defines the structure for project-level metadata, such as its name and version.
 */
export interface IProjectMetadata {
    projectName: string;
    version: string;
    activeLayoutKey: string;
    // FIX: Add property to store the project's live status. Made optional for backward compatibility.
    isLive?: boolean;
}

export interface LayoutState {
    ecsState: any;
    uiState: SectionData[];
}

export interface WindowDesign {
    id: string;
    name: string;
    layout: SectionData[];
    frameConfig: FrameConfig;
}


/**
 * @interface IProject
 * @description Defines the top-level structure for a saved project. It encapsulates all
 * necessary state information, including metadata, the ECS world state for different
 * layouts, and the state of all logic graphs.
 */
export interface IProject {
    /**
     * Metadata about the project.
     * @type {IProjectMetadata}
     */
    metadata: IProjectMetadata;

    /**
     * A record containing the serialized ECS state for different device layouts.
     * @type {{ default: any; desktop?: any; tablet?: any; mobile?: any; }}
     */
    layouts: {
        default: LayoutState;
        desktop?: LayoutState;
        tablet?: LayoutState;
        mobile?: LayoutState;
    };

    /**
     * The serialized state of the logic graph.
     * This is the output from `graph.serialize()`.
     * @type {any}
     */
    logicGraphState: any;

    /**
     * The serialized state of all designed windows and popups.
     * @type {Record<string, WindowDesign>}
     */
    windowDesigns?: Record<string, WindowDesign>;
}