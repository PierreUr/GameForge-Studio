import { ComponentBase } from './ComponentBase';

/**
 * @interface IColliderSize
 * @description Defines the dimensions for a collider shape.
 */
export interface IColliderSize {
    width: number;
    height: number;
}

/**
 * @class ColliderComponent
 * @description Represents the collision boundary of an entity.
 * It defines the shape (e.g., 'box', 'circle') and size of the collider,
 * which is used by the physics system to detect collisions.
 * Inherits from ComponentBase.
 */
export class ColliderComponent extends ComponentBase {
    /**
     * The shape of the collider. Can be 'box', 'circle', or other custom shapes.
     * @public
     * @type {string}
     */
    public shape: string;

    /**
     * The size of the collider, typically width and height.
     * @public
     * @type {IColliderSize}
     */
    public size: IColliderSize;

    /**
     * Initializes a new instance of the ColliderComponent.
     * @param {string} [shape='box'] - The shape of the collider. Defaults to 'box'.
     * @param {IColliderSize} [size={ width: 10, height: 10 }] - The dimensions of the collider.
     */
    constructor(shape: string = 'box', size: IColliderSize = { width: 10, height: 10 }) {
        super();
        this.shape = shape;
        this.size = size;
    }
}