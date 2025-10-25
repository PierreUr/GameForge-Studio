import { NodeBase } from '../NodeBase';

/**
 * @class SetComponentValueNode
 * @description An action node that sets the value of a specific property on a component of an entity.
 */
export class SetComponentValueNode extends NodeBase {
    /**
     * Initializes a new instance of the SetComponentValueNode.
     * @param {number} [x=0] - The x-coordinate of the node.
     * @param {number} [y=0] - The y-coordinate of the node.
     */
    constructor(x: number = 0, y: number = 0) {
        super(x, y);

        this.addInput({ id: 'flow_in', name: 'Execute', dataType: 'flow' });
        this.addInput({ id: 'entity_in', name: 'Entity', dataType: 'any' });
        this.addInput({ id: 'component_in', name: 'Component', dataType: 'string' });
        this.addInput({ id: 'property_in', name: 'Property', dataType: 'string' });
        this.addInput({ id: 'value_in', name: 'Value', dataType: 'any' });

        this.addOutput({ id: 'flow_out', name: 'Next', dataType: 'flow' });
    }
}