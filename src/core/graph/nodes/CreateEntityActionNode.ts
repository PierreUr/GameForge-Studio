import { NodeBase } from '../NodeBase';

/**
 * @class CreateEntityActionNode
 * @description An action node that creates a new entity from a specified template at a given position.
 */
export class CreateEntityActionNode extends NodeBase {
    /**
     * Initializes a new instance of the CreateEntityActionNode.
     * @param {number} [x=0] - The x-coordinate of the node.
     * @param {number} [y=0] - The y-coordinate of the node.
     */
    constructor(x: number = 0, y: number = 0) {
        super(x, y);

        // Define input ports
        this.addInput({ id: 'flow_in', name: 'Execute', dataType: 'flow' });
        this.addInput({ id: 'template_in', name: 'Template Name', dataType: 'string' });
        this.addInput({ id: 'position_in', name: 'Position', dataType: 'any' }); // Should be a 'vector2' or similar type

        // Define output ports
        this.addOutput({ id: 'flow_out', name: 'Next', dataType: 'flow' });
        this.addOutput({ id: 'entity_out', name: 'New Entity', dataType: 'any' }); // Should be 'entity' type
    }
}