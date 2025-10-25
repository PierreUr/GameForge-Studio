import { NodeId, INodeInput, INodeOutput } from './types';

// Add a serializable interface
export interface SerializableNode {
    id: NodeId;
    type: string;
    x: number;
    y: number;
}

/**
 * @class NodeBase
 * @description The fundamental base class for all nodes in the Logic Graph.
 * It defines the core properties of a node, such as its unique ID, position,
 * and its input and output ports.
 */
export class NodeBase {
    public id: NodeId; // Made mutable for deserialization
    public x: number;
    public y: number;
    public inputs: Map<string, INodeInput>;
    public outputs: Map<string, INodeOutput>;

    /**
     * Initializes a new instance of the NodeBase class.
     * @param {number} x - The initial x-coordinate of the node.
     * @param {number} y - The initial y-coordinate of the node.
     */
    constructor(x: number = 0, y: number = 0) {
        this.id = crypto.randomUUID();
        this.x = x;
        this.y = y;
        this.inputs = new Map();
        this.outputs = new Map();
    }

    /**
     * Adds an input port to the node.
     * @param {INodeInput} input - The input port to add.
     */
    protected addInput(input: INodeInput): void {
        this.inputs.set(input.id, input);
    }

    /**
     * Adds an output port to the node.
     * @param {INodeOutput} output - The output port to add.
     */
    protected addOutput(output: INodeOutput): void {
        this.outputs.set(output.id, output);
    }
    
    /**
     * Serializes the node's state into a plain object.
     * @returns {SerializableNode} A JSON-friendly representation of the node.
     */
    public serialize(): SerializableNode {
        return {
            id: this.id,
            type: this.constructor.name,
            x: this.x,
            y: this.y,
        };
    }
}