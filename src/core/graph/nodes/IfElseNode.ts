import { NodeBase } from '../NodeBase';

/**
 * @class IfElseNode
 * @description A control flow node that branches the execution path based on a boolean condition.
 */
export class IfElseNode extends NodeBase {
    /**
     * Initializes a new instance of the IfElseNode.
     * @param {number} [x=0] - The x-coordinate of the node.
     * @param {number} [y=0] - The y-coordinate of the node.
     */
    constructor(x: number = 0, y: number = 0) {
        super(x, y);

        this.addInput({ id: 'flow_in', name: 'Execute', dataType: 'flow' });
        this.addInput({ id: 'condition_in', name: 'Condition', dataType: 'boolean' });

        this.addOutput({ id: 'flow_true_out', name: 'True', dataType: 'flow' });
        this.addOutput({ id: 'flow_false_out', name: 'False', dataType: 'flow' });
    }
}