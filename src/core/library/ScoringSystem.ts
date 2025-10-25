import { SystemBase } from './SystemBase';
import { EntityManager } from '../ecs/EntityManager';
import { ComponentManager } from '../ecs/ComponentManager';
import { EventBus } from '../ecs/EventBus';
import { PlayerInputComponent } from './PlayerInputComponent';
import { ScoreComponent } from './ScoreComponent';
import { Entity } from '../ecs/types';

/**
 * @class ScoringSystem
 * @description An event-based system that handles score accumulation based on collision events.
 * It listens for collisions between a player and score-providing entities.
 * @extends SystemBase
 */
export class ScoringSystem extends SystemBase {
    private entityManager: EntityManager;
    private componentManager: ComponentManager;

    /**
     * Initializes a new instance of the ScoringSystem.
     * @param {EntityManager} entityManager - The entity manager to destroy entities.
     * @param {ComponentManager} componentManager - The component manager to access component data.
     */
    constructor(entityManager: EntityManager, componentManager: ComponentManager) {
        super([]); // This system doesn't operate on a component query in its update loop.
        this.entityManager = entityManager;
        this.componentManager = componentManager;

        EventBus.getInstance().subscribe('collision:detected', this.handleCollision);
    }

    /**
     * The update method is empty as this system is purely event-driven.
     * @param {number} deltaTime - The time elapsed since the last frame.
     */
    public update(deltaTime: number): void {
        // Event-driven, no logic needed here.
    }

    /**
     * Handles the 'collision:detected' event.
     * Checks if a player entity has collided with a pickup entity and transfers the score.
     * @private
     * @param {{ entityA: Entity, entityB: Entity }} payload - The event payload containing the two colliding entities.
     */
    private handleCollision = (payload: { entityA: Entity, entityB: Entity }): void => {
        const { entityA, entityB } = payload;

        const entityAPlayer = this.componentManager.getComponent(entityA, PlayerInputComponent);
        const entityAScore = this.componentManager.getComponent(entityA, ScoreComponent);
        const entityBScore = this.componentManager.getComponent(entityB, ScoreComponent);
        
        const entityBPlayer = this.componentManager.getComponent(entityB, PlayerInputComponent);

        let playerEntity: Entity | null = null;
        let pickupEntity: Entity | null = null;
        
        if (entityAPlayer && entityBScore) {
           playerEntity = entityA;
           pickupEntity = entityB;
        } else if (entityBPlayer && entityAScore) {
           playerEntity = entityB;
           pickupEntity = entityA;
        }

        if (playerEntity !== null && pickupEntity !== null) {
            const playerScore = this.componentManager.getComponent(playerEntity, ScoreComponent);
            const pickupScore = this.componentManager.getComponent(pickupEntity, ScoreComponent);

            if (playerScore && pickupScore) {
                playerScore.points += pickupScore.points;
                console.log(`[ScoringSystem] Player ${playerEntity} collected ${pickupScore.points} points. Total score: ${playerScore.points}`);
                this.entityManager.destroyEntity(pickupEntity);
            }
        }
    };
}
