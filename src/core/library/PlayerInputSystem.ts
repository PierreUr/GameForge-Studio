import { SystemBase } from './SystemBase';
import { EntityManager } from '../ecs/EntityManager';
import { ComponentManager } from '../ecs/ComponentManager';
import { PlayerInputComponent } from './PlayerInputComponent';
import { VelocityComponent } from './VelocityComponent';

/**
 * @class PlayerInputSystem
 * @description Handles keyboard input and translates it into actions for player-controlled entities.
 * @extends SystemBase
 */
export class PlayerInputSystem extends SystemBase {
    private activeKeys: Set<string> = new Set();
    private movementSpeed: number = 100; // Default speed, can be customized.

    /**
     * Initializes a new instance of the PlayerInputSystem.
     * Registers keyboard event listeners.
     */
    constructor() {
        super([PlayerInputComponent, VelocityComponent]);
        this.registerEventListeners();
    }

    private registerEventListeners(): void {
        // Check if running in a browser environment
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
        }
    }

    private handleKeyDown = (event: KeyboardEvent): void => {
        this.activeKeys.add(event.key);
    };

    private handleKeyUp = (event: KeyboardEvent): void => {
        this.activeKeys.delete(event.key);
    };

    /**
     * Updates entities based on currently pressed keys.
     * @param {number} deltaTime - The time elapsed since the last frame.
     * @param {EntityManager} entityManager - The entity manager instance.
     * @param {ComponentManager} componentManager - The component manager instance.
     */
    public update(deltaTime: number, entityManager: EntityManager, componentManager: ComponentManager): void {
        const entities = componentManager.getEntitiesWithComponents(this.requiredComponents);

        for (const entity of entities) {
            const input = componentManager.getComponent(entity, PlayerInputComponent);
            const velocity = componentManager.getComponent(entity, VelocityComponent);

            if (input && velocity) {
                // Reset velocity to handle no-input case and stop movement on key release.
                velocity.vx = 0;
                velocity.vy = 0;

                input.keyBindings.forEach((action, key) => {
                    if (this.activeKeys.has(key)) {
                        switch (action) {
                            case 'move_up':
                                velocity.vy -= this.movementSpeed;
                                break;
                            case 'move_down':
                                velocity.vy += this.movementSpeed;
                                break;
                            case 'move_left':
                                velocity.vx -= this.movementSpeed;
                                break;
                            case 'move_right':
                                velocity.vx += this.movementSpeed;
                                break;
                        }
                    }
                });
            }
        }
    }
    
    /**
     * Cleans up event listeners when the system is no longer needed.
     */
    public cleanup(): void {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.handleKeyDown);
            window.removeEventListener('keyup', this.handleKeyUp);
        }
    }

    /**
     * Simulates a key press for testing purposes.
     * @param {string} key - The key to simulate pressing.
     */
    public pressKey(key: string): void {
        this.activeKeys.add(key);
    }
    
    /**
     * Simulates a key release for testing purposes.
     * @param {string} key - The key to simulate releasing.
     */
    public releaseKey(key: string): void {
        this.activeKeys.delete(key);
    }
}
