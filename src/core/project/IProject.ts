/**
 * @interface IProjectMetadata
 * @description Defines the structure for project-level metadata, such as its name and version.
 */
export interface IProjectMetadata {
    projectName: string;
    version: string;
}

/**
 * @interface IProject
 * @description Defines the top-level structure for a saved project. It encapsulates all
 * necessary state information, including metadata, the ECS world state, and the
 * state of all logic graphs.
 */
export interface IProject {
    /**
     * Metadata about the project.
     * @type {IProjectMetadata}
     */
    metadata: IProjectMetadata;

    /**
     * The serialized state of the Entity-Component-System world.
     * This is the output from `world.getProjectState()`.
     * @type {any}
     */
    ecsState: any;

    /**
     * The serialized state of the logic graph.
     * This is the output from `graph.serialize()`.
     * @type {any}
     */
    logicGraphState: any;
}