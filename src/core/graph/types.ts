/**
 * A unique identifier for a node within a graph.
 */
export type NodeId = string;

/**
 * Defines the data type for a port.
 * 'flow' represents execution flow, while others represent data types.
 */
export type PortDataType = 'flow' | 'number' | 'string' | 'boolean' | 'any';

/**
 * Base interface for a port on a node (either input or output).
 */
export interface IPort {
    id: string;
    name: string;
    dataType: PortDataType;
}

/**
 * Represents an input port on a node.
 */
export interface INodeInput extends IPort {}

/**
 * Represents an output port on a node.
 */
export interface INodeOutput extends IPort {}
