import { ComponentBase } from './ComponentBase';

/**
 * @class PhysicsBodyComponent
 * @description Represents the physical properties of an entity, such as mass and friction.
 * This component is essential for any physics-based interactions and calculations.
 * Inherits from ComponentBase, providing the default `isActive` property.
 */
export class PhysicsBodyComponent extends ComponentBase {
    /**
     * The mass of the entity, affecting how it responds to forces.
     * @public
     * @type {number}
     */
    public mass: number;

    /**
     * The friction coefficient, affecting how the entity slows down over time.
     * @public
     * @type {number}
     */
    public friction: number;

    /**
     * Initializes a new instance of the PhysicsBodyComponent.
     * @param {number} [mass=1] - The initial mass of the entity. Defaults to 1.
     * @param {number} [friction=0.1] - The initial friction coefficient. Defaults to 0.1.
     */
    constructor(mass: number = 1, friction: number = 0.1) {
        super();
        this.mass = mass;
        this.friction = friction;
    }
}
