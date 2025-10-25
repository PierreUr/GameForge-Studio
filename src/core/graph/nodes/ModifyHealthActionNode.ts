import { NodeBase } from '../NodeBase';

/**
 * @class ModifyHealthActionNode
 * @description An action node that modifies the health of a target entity.
 */
export class ModifyHealthActionNode extends NodeBase {
    /**
     * Initializes a new instance of the ModifyHealthActionNode.
     * @param {number} [x=0] - The x-coordinate of the node.
     * @param {number} [y=0] - The y-coordinate of the node.
     */
    constructor(x: number = 0, y: number = 0) {
        super(x, y);

        // Define input ports
        this.addInput({ id: 'flow_in', name: 'Execute', dataType: 'flow' });
        this.addInput({ id: 'entity_in', name: 'Target Entity', dataType: 'any' }); // Should be 'entity' type
        this.addInput({ id: 'amount_in', name: 'Amount', dataType: 'number' });
        
        // Define output ports
        this.addOutput({ id: 'flow_out', name: 'Next', dataType: 'flow' });
    }
}