import { NodeBase } from '../NodeBase';

/**
 * @class GetComponentValueNode
 * @description A node that retrieves the value of a specific property from a component on an entity.
 */
export class GetComponentValueNode extends NodeBase {
    /**
     * Initializes a new instance of the GetComponentValueNode.
     * @param {number} [x=0] - The x-coordinate of the node.
     * @param {number} [y=0] - The y-coordinate of the node.
     */
    constructor(x: number = 0, y: number = 0) {
        super(x, y);

        this.addInput({ id: 'entity_in', name: 'Entity', dataType: 'any' });
        this.addInput({ id: 'component_in', name: 'Component', dataType: 'string' });
        this.addInput({ id: 'property_in', name: 'Property', dataType: 'string' });
        
        this.addOutput({ id: 'value_out', name: 'Value', dataType: 'any' });
    }
}