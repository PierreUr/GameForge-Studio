import { NodeId } from './types';

export interface SerializableConnection {
    id: string;
    fromNodeId: NodeId;
    fromPortId: string;
    toNodeId: NodeId;
    toPortId: string;
}

/**
 * @class Connection
 * @description Represents a connection (edge) between an output port of one node
 * and an input port of another node in the Logic Graph.
 */
export class Connection {
    public id: string; // Made mutable for deserialization
    public fromNodeId: NodeId;
    public fromPortId: string;
    public toNodeId: NodeId;
    public toPortId: string;

    /**
     * Initializes a new instance of the Connection class.
     * @param {NodeId} fromNodeId - The ID of the source node.
     * @param {string} fromPortId - The ID of the source port on the source node.
     * @param {NodeId} toNodeId - The ID of the target node.
     * @param {string} toPortId - The ID of the target port on the target node.
     */
    constructor(fromNodeId: NodeId, fromPortId: string, toNodeId: NodeId, toPortId: string) {
        this.id = crypto.randomUUID();
        this.fromNodeId = fromNodeId;
        this.fromPortId = fromPortId;
        this.toNodeId = toNodeId;
        this.toPortId = toPortId;
    }

    /**
     * Serializes the connection's state into a plain object.
     * @returns {SerializableConnection} A JSON-friendly representation of the connection.
     */
    public serialize(): SerializableConnection {
        return {
            id: this.id,
            fromNodeId: this.fromNodeId,
            fromPortId: this.fromPortId,
            toNodeId: this.toNodeId,
            toPortId: this.toPortId,
        };
    }
}