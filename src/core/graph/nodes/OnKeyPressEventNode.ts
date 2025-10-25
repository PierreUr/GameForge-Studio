import { NodeBase } from '../NodeBase';

/**
 * @class OnKeyPressEventNode
 * @description An event node that triggers when a specific keyboard key is pressed.
 */
export class OnKeyPressEventNode extends NodeBase {
    /**
     * Initializes a new instance of the OnKeyPressEventNode.
     * @param {number} [x=0] - The x-coordinate of the node.
     * @param {number} [y=0] - The y-coordinate of the node.
     */
    constructor(x: number = 0, y: number = 0) {
        super(x, y);

        // Define the input and output ports
        this.addInput({ id: 'key_in', name: 'Key', dataType: 'string' });
        this.addOutput({ id: 'flow_out', name: 'On Press', dataType: 'flow' });
    }
}