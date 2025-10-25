import { Graph } from './Graph';
import { ExecutionContext } from './ExecutionContext';
import { Entity } from '../ecs/types';

/**
 * @class GraphInterpreter
 * @description The runtime engine for executing the logic defined in a Graph.
 * (This is currently a placeholder for future implementation).
 */
export class GraphInterpreter {
    private graph: Graph;

    /**
     * Initializes a new instance of the GraphInterpreter.
     * @param {Graph} graph - The logic graph to be executed.
     */
    constructor(graph: Graph) {
        this.graph = graph;
        console.log('[GraphInterpreter] Initialized.');
    }

    /**
     * Starts the execution of the graph from a specific event node.
     * @param {string} eventName - The name of the event that triggered the execution.
     * @param {any} payload - The data associated with the event.
     */
    public executeEvent(eventName: string, payload: any): void {
        console.log(`[GraphInterpreter] Event "${eventName}" triggered. Creating execution context.`);
        // Future logic: Find corresponding event node in the graph and start traversing the execution flow.

        // For now, we assume a payload might contain an entity to scope to.
        // This is a simplification; a real implementation would be more robust.
        const primaryEntity: Entity | undefined = payload.entityA ?? payload.entity;
        
        if (primaryEntity !== undefined) {
            const context = new ExecutionContext(primaryEntity);
            console.log(`[GraphInterpreter] Context created with entity scope: ${context.entityScope}`);
            // TODO: Start graph traversal with this context.
        } else {
            console.warn(`[GraphInterpreter] Event "${eventName}" triggered but no primary entity found in payload to create a context.`);
        }
    }
}