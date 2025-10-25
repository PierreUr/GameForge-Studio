import { ISystem } from '../ecs/ISystem';
import { EntityManager } from '../ecs/EntityManager';
import { ComponentManager } from '../ecs/ComponentManager';
import { ComponentClass } from '../ecs/types';
import { IComponent } from '../ecs/Component';

/**
 * @abstract
 * @class SystemBase
 * @description An abstract base class for game-specific systems, providing a structured
 * template for implementing system logic. It ensures that systems declare their
 * required components and implement an update method.
 */
export abstract class SystemBase implements ISystem {
    /**
     * An array of component classes that an entity must possess for this system
     * to operate on it. This is used by the system to query for relevant entities.
     * @public
     * @readonly
     * @type {ComponentClass<IComponent>[]}
     */
    public readonly requiredComponents: ComponentClass<IComponent>[];

    /**
     * Initializes a new instance of the SystemBase class.
     * @param {ComponentClass<IComponent>[]} requiredComponents - An array of component classes that this system requires to process an entity.
     */
    protected constructor(requiredComponents: ComponentClass<IComponent>[]) {
        this.requiredComponents = requiredComponents;
    }

    /**
     * The core logic of the system, which is executed on every frame of the game loop.
     * This method must be implemented by all concrete child classes.
     * @abstract
     * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
     * @param {EntityManager} entityManager - A reference to the EntityManager for entity-related operations.
     * @param {ComponentManager} componentManager - A reference to the ComponentManager for component-related operations.
     */
    public abstract update(deltaTime: number, entityManager: EntityManager, componentManager: ComponentManager): void;
}
