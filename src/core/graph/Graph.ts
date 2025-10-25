import { NodeBase, SerializableNode } from './NodeBase';
import { Connection, SerializableConnection } from './Connection';
import { NodeId } from './types';
import { createNode } from './nodeFactory';

interface SerializedGraph {
    nodes: SerializableNode[];
    connections: SerializableConnection[];
}

/**
 * @class Graph
 * @description A data structure that represents a complete logic graph.
 * It serves as a container for all nodes and connections, managing their
 * addition, removal, and retrieval.
 */
export class Graph {
    public nodes: Map<NodeId, NodeBase>;
    public connections: Map<string, Connection>;

    /**
     * Initializes a new instance of the Graph class.
     */
    constructor() {
        this.nodes = new Map();
        this.connections = new Map();
    }

    /**
     * Adds a node to the graph.
     * @param {NodeBase} node - The node to add.
     */
    public addNode(node: NodeBase): void {
        if (this.nodes.has(node.id)) {
            console.warn(`[Graph] Node with ID ${node.id} already exists.`);
            return;
        }
        this.nodes.set(node.id, node);
    }

    /**
     * Removes a node from the graph, along with any connections attached to it.
     * @param {NodeId} nodeId - The ID of the node to remove.
     * @returns {boolean} True if the node was found and removed, false otherwise.
     */
    public removeNode(nodeId: NodeId): boolean {
        if (!this.nodes.has(nodeId)) {
            return false;
        }

        // Remove all connections associated with this node
        this.connections.forEach((conn, connId) => {
            if (conn.fromNodeId === nodeId || conn.toNodeId === nodeId) {
                this.connections.delete(connId);
            }
        });

        return this.nodes.delete(nodeId);
    }

    /**
     * Adds a connection to the graph.
     * @param {Connection} connection - The connection to add.
     */
    public addConnection(connection: Connection): void {
        if (this.connections.has(connection.id)) {
            console.warn(`[Graph] Connection with ID ${connection.id} already exists.`);
            return;
        }
        // Basic validation
        if (!this.nodes.has(connection.fromNodeId) || !this.nodes.has(connection.toNodeId)) {
            console.error(`[Graph] Cannot add connection: one or both nodes do not exist.`);
            return;
        }
        this.connections.set(connection.id, connection);
    }

    /**
     * Removes a connection from the graph.
     * @param {string} connectionId - The ID of the connection to remove.
     * @returns {boolean} True if the connection was found and removed, false otherwise.
     */
    public removeConnection(connectionId: string): boolean {
        return this.connections.delete(connectionId);
    }

    /**
     * Serializes the entire graph state into a JSON-friendly object.
     * @returns {SerializedGraph} A plain object representing the graph.
     */
    public serialize(): SerializedGraph {
        const serializedNodes = Array.from(this.nodes.values()).map(node => node.serialize());
        const serializedConnections = Array.from(this.connections.values()).map(conn => conn.serialize());
        return {
            nodes: serializedNodes,
            connections: serializedConnections,
        };
    }

    /**
     * Deserializes graph state from a plain object, reconstructing the graph.
     * @param {SerializedGraph} state - The serialized graph state.
     */
    public deserialize(state: SerializedGraph): void {
        this.nodes.clear();
        this.connections.clear();

        if (state.nodes) {
            for (const nodeData of state.nodes) {
                const nodeInstance = createNode(nodeData.type, nodeData.x, nodeData.y);
                if (nodeInstance) {
                    nodeInstance.id = nodeData.id; // Restore original ID
                    this.addNode(nodeInstance);
                }
            }
        }
        
        if (state.connections) {
            for (const connData of state.connections) {
                const connInstance = new Connection(connData.fromNodeId, connData.fromPortId, connData.toNodeId, connData.toPortId);
                connInstance.id = connData.id; // Restore original ID
                this.addConnection(connInstance);
            }
        }
    }
}