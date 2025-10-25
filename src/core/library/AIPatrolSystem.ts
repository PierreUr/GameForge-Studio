import { SystemBase } from './SystemBase';
import { EntityManager } from '../ecs/EntityManager';
import { ComponentManager } from '../ecs/ComponentManager';
import { AIPatrolComponent } from './AIPatrolComponent';
import { PositionComponent } from './PositionComponent';
import { VelocityComponent } from './VelocityComponent';

/**
 * @class AIPatrolSystem
 * @description Manages the movement of AI entities along a set of waypoints.
 * @extends SystemBase
 */
export class AIPatrolSystem extends SystemBase {
    /**
     * Initializes a new instance of the AIPatrolSystem.
     */
    constructor() {
        super([AIPatrolComponent, PositionComponent, VelocityComponent]);
    }

    /**
     * Updates AI entities to move towards their current waypoint.
     * @param {number} deltaTime - The time elapsed since the last frame.
     * @param {EntityManager} entityManager - The entity manager instance.
     * @param {ComponentManager} componentManager - The component manager instance.
     */
    public update(deltaTime: number, entityManager: EntityManager, componentManager: ComponentManager): void {
        const entities = componentManager.getEntitiesWithComponents(this.requiredComponents);

        for (const entity of entities) {
            const patrol = componentManager.getComponent(entity, AIPatrolComponent);
            const position = componentManager.getComponent(entity, PositionComponent);
            const velocity = componentManager.getComponent(entity, VelocityComponent);

            if (patrol && position && velocity && patrol.waypoints.length > 0) {
                if (patrol.currentWaypointIndex >= patrol.waypoints.length) {
                    patrol.currentWaypointIndex = 0; // Sanity check
                }

                const targetWaypoint = patrol.waypoints[patrol.currentWaypointIndex];

                const dx = targetWaypoint.x - position.x;
                const dy = targetWaypoint.y - position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // A small threshold to prevent jittering and consider the waypoint "reached".
                const REACH_THRESHOLD = 5;

                if (distance < REACH_THRESHOLD) {
                    // Arrived at waypoint, advance to the next one.
                    patrol.currentWaypointIndex = (patrol.currentWaypointIndex + 1) % patrol.waypoints.length;
                    velocity.vx = 0;
                    velocity.vy = 0;
                } else {
                    // Move towards the current waypoint.
                    velocity.vx = (dx / distance) * patrol.speed;
                    velocity.vy = (dy / distance) * patrol.speed;
                }
            } else if (velocity) {
                // If there are no waypoints, the entity should not move.
                velocity.vx = 0;
                velocity.vy = 0;
            }
        }
    }
}
