import { EntityManager } from './EntityManager';
import { ComponentManager } from './ComponentManager';

/**
 * @interface ISystem
 * @description Defines the contract for a system in the ECS architecture.
 * Systems contain the logic that operates on entities with specific components.
 */
export interface ISystem {
    /**
     * The update method is called by the SystemManager on every frame of the game loop.
     * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
     * @param {EntityManager} [entityManager] - Optional reference to the EntityManager for querying entities.
     * @param {ComponentManager} [componentManager] - Optional reference to the ComponentManager for querying components.
     */
    update(deltaTime: number, entityManager?: EntityManager, componentManager?: ComponentManager): void;
}
