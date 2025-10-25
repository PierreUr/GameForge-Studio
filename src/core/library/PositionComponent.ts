import { ComponentBase } from './ComponentBase';

/**
 * @class PositionComponent
 * @description Represents the position of an entity in 3D space.
 * Inherits from ComponentBase, providing the default `isActive` property.
 * This component is fundamental for any entity that needs to have a location
 * within the game world.
 */
export class PositionComponent extends ComponentBase {
    /**
     * The x-coordinate of the entity's position.
     * @public
     * @type {number}
     */
    public x: number;

    /**
     * The y-coordinate of the entity's position.
     * @public
     * @type {number}
     */
    public y: number;

    /**
     * The z-coordinate of the entity's position.
     * This can be used for depth sorting in 2D games or for true 3D positioning.
     * @public
     * @type {number}
     */
    public z: number;

    /**
     * Initializes a new instance of the PositionComponent.
     * @param {number} [x=0] - The initial x-coordinate. Defaults to 0.
     * @param {number} [y=0] - The initial y-coordinate. Defaults to 0.
     * @param {number} [z=0] - The initial z-coordinate. Defaults to 0.
     */
    constructor(x: number = 0, y: number = 0, z: number = 0) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
