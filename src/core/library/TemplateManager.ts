import { World } from '../ecs/World';
import { Entity } from '../ecs/types';
import { PositionComponent } from './PositionComponent';
import { VelocityComponent } from './VelocityComponent';
import { HealthComponent } from './HealthComponent';
import { PlayerInputComponent } from './PlayerInputComponent';
import { SpriteComponent } from './SpriteComponent';
import { PhysicsBodyComponent } from './PhysicsBodyComponent';
import { ColliderComponent } from './ColliderComponent';
import { AIPatrolComponent } from './AIPatrolComponent';
import { ScoreComponent } from './ScoreComponent';

/**
 * @class TemplateManager
 * @description Manages the creation of entities from predefined templates.
 * This class facilitates the instantiation of complex entities like players,
 * enemies, or items by bundling the required components and initial values.
 */
export class TemplateManager {
    private world: World;

    /**
     * Initializes a new instance of the TemplateManager.
     * @param {World} world - A reference to the main World object, providing access to ECS managers.
     */
    constructor(world: World) {
        this.world = world;
    }

    /**
     * Creates an entity from a named template and customizes it with provided options.
     * @param {string} templateName - The name of the template to use (e.g., 'player', 'enemy').
     * @param {any} [options={}] - An optional object with properties to override the template's default component values (e.g., { position: { x: 100, y: 150 } }).
     * @returns {Entity | undefined} The ID of the newly created entity, or undefined if the template name is not found.
     */
    public createEntityFromTemplate(templateName: string, options: any = {}): Entity | undefined {
        let entity: Entity;
        
        switch (templateName) {
            /**
             * @case player
             * @description Creates a player entity with all standard player components.
             * @option {object} position - An object with x and y to override the default position.
             */
            case 'player':
                entity = this.world.entityManager.createEntity();

                // Position: Use provided options or default to (0,0)
                const startPos = options.position || { x: 0, y: 0 };
                this.world.componentManager.addComponent(entity, PositionComponent, startPos.x, startPos.y);

                // Add other standard player components
                this.world.componentManager.addComponent(entity, VelocityComponent);
                this.world.componentManager.addComponent(entity, HealthComponent, 100, 100);
                this.world.componentManager.addComponent(entity, PlayerInputComponent, new Map([
                    ['w', 'move_up'],
                    ['a', 'move_left'],
                    ['s', 'move_down'],
                    ['d', 'move_right']
                ]));
                this.world.componentManager.addComponent(entity, SpriteComponent, 'player.png', 32, 32);
                this.world.componentManager.addComponent(entity, PhysicsBodyComponent, 1, 0.2);
                this.world.componentManager.addComponent(entity, ColliderComponent, 'box', { width: 32, height: 32 });
                
                return entity;

            /**
             * @case enemy
             * @description Creates an enemy entity with AI patrol, health, and physics.
             * @option {object} position - An object with x and y to override the default position.
             */
            case 'enemy':
                entity = this.world.entityManager.createEntity();

                const enemyStartPos = options.position || { x: 0, y: 0 };
                this.world.componentManager.addComponent(entity, PositionComponent, enemyStartPos.x, enemyStartPos.y);
                this.world.componentManager.addComponent(entity, VelocityComponent);
                this.world.componentManager.addComponent(entity, HealthComponent, 50);
                this.world.componentManager.addComponent(entity, SpriteComponent, 'enemy.png', 32, 32);
                this.world.componentManager.addComponent(entity, PhysicsBodyComponent);
                this.world.componentManager.addComponent(entity, ColliderComponent, 'box', { width: 32, height: 32 });
                this.world.componentManager.addComponent(entity, AIPatrolComponent, [], 25);
                
                return entity;

            /**
             * @case obstacle
             * @description Creates a static obstacle entity with physics and a sprite.
             * @option {object} position - An object with x and y to override the default position.
             */
            case 'obstacle':
                entity = this.world.entityManager.createEntity();

                const obstacleStartPos = options.position || { x: 0, y: 0 };
                this.world.componentManager.addComponent(entity, PositionComponent, obstacleStartPos.x, obstacleStartPos.y);
                this.world.componentManager.addComponent(entity, PhysicsBodyComponent, 0, 0.5); // Mass 0 = static
                this.world.componentManager.addComponent(entity, ColliderComponent, 'box', { width: 50, height: 50 });
                this.world.componentManager.addComponent(entity, SpriteComponent, 'obstacle.png', 50, 50);

                return entity;

            /**
             * @case pickup
             * @description Creates a pickup item entity with a score value.
             * @option {object} position - An object with x and y to override the default position.
             * @option {number} score - The point value of the pickup.
             */
            case 'pickup':
                entity = this.world.entityManager.createEntity();

                const pickupStartPos = options.position || { x: 0, y: 0 };
                const scoreValue = options.score || 100;
                this.world.componentManager.addComponent(entity, PositionComponent, pickupStartPos.x, pickupStartPos.y);
                this.world.componentManager.addComponent(entity, ColliderComponent, 'box', { width: 20, height: 20 });
                this.world.componentManager.addComponent(entity, ScoreComponent, scoreValue);
                this.world.componentManager.addComponent(entity, SpriteComponent, 'pickup.png', 20, 20);
                
                return entity;

            default:
                console.warn(`[TemplateManager] Template with name "${templateName}" not found.`);
                return undefined;
        }
    }
}