import { SystemBase } from './SystemBase';
import { EntityManager } from '../ecs/EntityManager';
import { ComponentManager } from '../ecs/ComponentManager';
import { PositionComponent } from './PositionComponent';
import { VelocityComponent } from './VelocityComponent';
import { PhysicsBodyComponent } from './PhysicsBodyComponent';
import { ColliderComponent } from './ColliderComponent';
import { EventBus } from '../ecs/EventBus';
import { Entity } from '../ecs/types';

/**
 * @class PhysicsSystem
 * @description Manages physics-related logic, including applying friction and detecting collisions.
 * This system operates on entities possessing Position, Velocity, PhysicsBody, and Collider components.
 * @extends SystemBase
 */
export class PhysicsSystem extends SystemBase {
    /**
     * Initializes a new instance of the PhysicsSystem.
     * It requires entities to have Position, Velocity, PhysicsBody, and Collider components.
     */
    constructor() {
        super([PositionComponent, VelocityComponent, PhysicsBodyComponent, ColliderComponent]);
    }

    /**
     * Updates all relevant entities by applying friction and checking for collisions.
     * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
     * @param {EntityManager} entityManager - The entity manager instance.
     * @param {ComponentManager} componentManager - The component manager instance.
     */
    public update(deltaTime: number, entityManager: EntityManager, componentManager: ComponentManager): void {
        const entities = Array.from(componentManager.getEntitiesWithComponents(this.requiredComponents));

        // Apply friction and prepare for collision checks
        for (const entity of entities) {
            const velocity = componentManager.getComponent(entity, VelocityComponent);
            const physicsBody = componentManager.getComponent(entity, PhysicsBodyComponent);

            if (velocity && physicsBody) {
                // Apply friction to slow down the entity
                velocity.vx *= (1 - physicsBody.friction * deltaTime);
                velocity.vy *= (1 - physicsBody.friction * deltaTime);
            }
        }

        // Check for collisions between all pairs of entities
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entityA = entities[i];
                const entityB = entities[j];

                if (this.isColliding(entityA, entityB, componentManager)) {
                    EventBus.getInstance().publish('collision:detected', { entityA, entityB });
                }
            }
        }
    }

    /**
     * Checks if two entities are colliding using AABB (Axis-Aligned Bounding Box) collision detection.
     * @private
     * @param {Entity} entityA - The first entity.
     * @param {Entity} entityB - The second entity.
     * @param {ComponentManager} componentManager - The component manager to retrieve component data.
     * @returns {boolean} True if the entities are colliding, false otherwise.
     */
    private isColliding(entityA: Entity, entityB: Entity, componentManager: ComponentManager): boolean {
        const posA = componentManager.getComponent(entityA, PositionComponent);
        const colA = componentManager.getComponent(entityA, ColliderComponent);
        const posB = componentManager.getComponent(entityB, PositionComponent);
        const colB = componentManager.getComponent(entityB, ColliderComponent);

        if (!posA || !colA || !posB || !colB) {
            return false;
        }

        // AABB collision check
        const rectA = { x: posA.x, y: posA.y, width: colA.size.width, height: colA.size.height };
        const rectB = { x: posB.x, y: posB.y, width: colB.size.width, height: colB.size.height };

        return (
            rectA.x < rectB.x + rectB.width &&
            rectA.x + rectA.width > rectB.x &&
            rectA.y < rectB.y + rectB.height &&
            rectA.y + rectA.height > rectB.y
        );
    }
}
