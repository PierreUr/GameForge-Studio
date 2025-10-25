import { ComponentBase } from './ComponentBase';

/**
 * @class VelocityComponent
 * @description Represents the velocity of an entity in 2D space.
 * Inherits from ComponentBase, providing the default `isActive` property.
 * This component is used by movement systems to update an entity's position.
 */
export class VelocityComponent extends ComponentBase {
    /**
     * The velocity of the entity on the x-axis.
     * @public
     * @type {number}
     */
    public vx: number;

    /**
     * The velocity of the entity on the y-axis.
     * @public
     * @type {number}
     */
    public vy: number;

    /**
     * Initializes a new instance of the VelocityComponent.
     * @param {number} [vx=0] - The initial velocity on the x-axis. Defaults to 0.
     * @param {number} [vy=0] - The initial velocity on the y-axis. Defaults to 0.
     */
    constructor(vx: number = 0, vy: number = 0) {
        super();
        this.vx = vx;
        this.vy = vy;
    }
}
