import { ComponentBase } from './ComponentBase';

/**
 * @class HealthComponent
 * @description Represents the health of an entity, including its maximum and current health points.
 * Inherits from ComponentBase, providing the default `isActive` property.
 */
export class HealthComponent extends ComponentBase {
    /**
     * The maximum health points of the entity.
     * @public
     * @type {number}
     */
    public maxHealth: number;

    /**
     * The current health points of the entity.
     * @public
     * @type {number}
     */
    public currentHealth: number;

    /**
     * Initializes a new instance of the HealthComponent.
     * @param {number} [maxHealth=100] - The maximum health. Defaults to 100.
     * @param {number} [currentHealth] - The current health. Defaults to the value of maxHealth if not provided.
     */
    constructor(maxHealth: number = 100, currentHealth?: number) {
        super();
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth !== undefined ? currentHealth : maxHealth;
    }
}
