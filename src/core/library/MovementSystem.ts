import { SystemBase } from './SystemBase';
import { EntityManager } from '../ecs/EntityManager';
import { ComponentManager } from '../ecs/ComponentManager';
import { PositionComponent } from './PositionComponent';
import { VelocityComponent } from './VelocityComponent';

/**
 * @class MovementSystem
 * @description A concrete system that updates the position of entities based on their velocity.
 * It operates on entities that have both a PositionComponent and a VelocityComponent.
 * Inherits from SystemBase.
 */
export class MovementSystem extends SystemBase {
    /**
     * Initializes a new instance of the MovementSystem.
     * Specifies that this system requires PositionComponent and VelocityComponent.
     */
    constructor() {
        super([PositionComponent, VelocityComponent]);
    }

    /**
     * Updates the position of all entities with a PositionComponent and a VelocityComponent.
     * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
     * @param {EntityManager} entityManager - The entity manager for querying entities.
     * @param {ComponentManager} componentManager - The component manager for querying components.
     */
    public update(deltaTime: number, entityManager: EntityManager, componentManager: ComponentManager): void {
        const entities = componentManager.getEntitiesWithComponents(this.requiredComponents);

        for (const entity of entities) {
            const position = componentManager.getComponent(entity, PositionComponent);
            const velocity = componentManager.getComponent(entity, VelocityComponent);

            if (position && velocity) {
                position.x += velocity.vx * deltaTime;
                position.y += velocity.vy * deltaTime;
            }
        }
    }
}
