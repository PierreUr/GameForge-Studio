import { NodeBase } from './NodeBase';
import { OnCollisionEventNode } from './nodes/OnCollisionEventNode';
import { OnKeyPressEventNode } from './nodes/OnKeyPressEventNode';
import { ModifyHealthActionNode } from './nodes/ModifyHealthActionNode';
import { CreateEntityActionNode } from './nodes/CreateEntityActionNode';
import { DestroyEntityActionNode } from './nodes/DestroyEntityActionNode';
import { GetComponentValueNode } from './nodes/GetComponentValueNode';
import { SetComponentValueNode } from './nodes/SetComponentValueNode';
import { IfElseNode } from './nodes/IfElseNode';
import { AddNode } from './nodes/AddNode';

type NodeConstructor = new (x: number, y: number) => NodeBase;

// A registry of all available node types.
const nodeRegistry: Map<string, NodeConstructor> = new Map();

// Register all known node types.
nodeRegistry.set('OnCollisionEventNode', OnCollisionEventNode);
nodeRegistry.set('OnKeyPressEventNode', OnKeyPressEventNode);
nodeRegistry.set('ModifyHealthActionNode', ModifyHealthActionNode);
nodeRegistry.set('CreateEntityActionNode', CreateEntityActionNode);
nodeRegistry.set('DestroyEntityActionNode', DestroyEntityActionNode);
nodeRegistry.set('GetComponentValueNode', GetComponentValueNode);
nodeRegistry.set('SetComponentValueNode', SetComponentValueNode);
nodeRegistry.set('IfElseNode', IfElseNode);
nodeRegistry.set('AddNode', AddNode);


/**
 * Creates an instance of a node class based on its type name.
 * @param {string} type - The name of the node class (e.g., 'OnCollisionEventNode').
 * @param {number} x - The x-coordinate for the new node.
 * @param {number} y - The y-coordinate for the new node.
 * @returns {NodeBase | undefined} An instance of the requested node, or undefined if the type is not registered.
 */
export function createNode(type: string, x: number, y: number): NodeBase | undefined {
    const NodeClass = nodeRegistry.get(type);
    if (!NodeClass) {
        console.warn(`[nodeFactory] Node type "${type}" not found in registry.`);
        return undefined;
    }
    return new NodeClass(x, y);
}