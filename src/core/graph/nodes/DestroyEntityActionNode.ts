import { NodeBase } from '../NodeBase';

/**
 * @class DestroyEntityActionNode
 * @description An action node that destroys a target entity from the world.
 */
export class DestroyEntityActionNode extends NodeBase {
    /**
     * Initializes a new instance of the DestroyEntityActionNode.
     * @param {number} [x=0] - The x-coordinate of the node.
     * @param {number} [y=0] - The y-coordinate of the node.
     */
    constructor(x: number = 0, y: number = 0) {
        super(x, y);

        // Define input ports
        this.addInput({ id: 'flow_in', name: 'Execute', dataType: 'flow' });
        this.addInput({ id: 'entity_in', name: 'Target Entity', dataType: 'any' }); // Should be 'entity' type
        
        // Define output ports
        this.addOutput({ id: 'flow_out', name: 'Next', dataType: 'flow' });
    }
}
