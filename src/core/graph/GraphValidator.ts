import { Graph } from './Graph';
import { Connection } from './Connection';
import { PortDataType } from './types';

/**
 * @class GraphValidator
 * @description Provides methods to validate the logical integrity of a Graph.
 */
export class GraphValidator {
    /**
     * Validates a graph for logical errors, such as incompatible port connections.
     * @param {Graph} graph - The graph to validate.
     * @returns {string[]} An array of error messages. An empty array indicates a valid graph.
     */
    public validate(graph: Graph): string[] {
        const errors: string[] = [];

        for (const connection of graph.connections.values()) {
            const error = this.validateConnection(connection, graph);
            if (error) {
                errors.push(error);
            }
        }

        return errors;
    }

    /**
     * Validates a single connection.
     * @private
     * @param {Connection} connection - The connection to validate.
     * @param {Graph} graph - The parent graph.
     * @returns {string | null} An error message if invalid, otherwise null.
     */
    private validateConnection(connection: Connection, graph: Graph): string | null {
        const fromNode = graph.nodes.get(connection.fromNodeId);
        const toNode = graph.nodes.get(connection.toNodeId);

        if (!fromNode || !toNode) {
            return `Connection ${connection.id} references non-existent nodes.`;
        }

        const fromPort = fromNode.outputs.get(connection.fromPortId);
        const toPort = toNode.inputs.get(connection.toPortId);

        if (!fromPort || !toPort) {
            return `Connection ${connection.id} references non-existent ports.`;
        }

        // Type compatibility check
        if (fromPort.dataType !== 'any' && toPort.dataType !== 'any' && fromPort.dataType !== toPort.dataType) {
            return `Type mismatch in connection ${connection.id}: Cannot connect ${fromPort.dataType} to ${toPort.dataType}.`;
        }
        
        return null;
    }
}
