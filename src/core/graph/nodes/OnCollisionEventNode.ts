import { NodeBase } from '../NodeBase';

/**
 * @class OnCollisionEventNode
 * @description An event node that triggers when a collision is detected between two entities.
 * It provides the two colliding entities as data outputs.
 */
export class OnCollisionEventNode extends NodeBase {
    /**
     * Initializes a new instance of the OnCollisionEventNode.
     * @param {number} [x=0] - The x-coordinate of the node.
     * @param {number} [y=0] - The y-coordinate of the node.
     */
    constructor(x: number = 0, y: number = 0) {
        super(x, y);

        // Define the output ports for this event node
        this.addOutput({ id: 'flow_out', name: 'On Collision', dataType: 'flow' });
        this.addOutput({ id: 'entityA_out', name: 'Entity A', dataType: 'any' }); // Should be 'entity' type later
        this.addOutput({ id: 'entityB_out', name: 'Entity B', dataType: 'any' }); // Should be 'entity' type later
    }
}