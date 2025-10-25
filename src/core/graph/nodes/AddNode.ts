import { NodeBase } from '../NodeBase';

/**
 * @class AddNode
 * @description A math node that performs addition on two number inputs.
 */
export class AddNode extends NodeBase {
    /**
     * Initializes a new instance of the AddNode.
     * @param {number} [x=0] - The x-coordinate of the node.
     * @param {number} [y=0] - The y-coordinate of the node.
     */
    constructor(x: number = 0, y: number = 0) {
        super(x, y);

        this.addInput({ id: 'a_in', name: 'A', dataType: 'number' });
        this.addInput({ id: 'b_in', name: 'B', dataType: 'number' });
        
        this.addOutput({ id: 'result_out', name: 'Result', dataType: 'number' });
    }
}