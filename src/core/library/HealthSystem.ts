import { SystemBase } from './SystemBase';
import { EntityManager } from '../ecs/EntityManager';
import { ComponentManager } from '../ecs/ComponentManager';
import { HealthComponent } from './HealthComponent';
import { EventBus } from '../ecs/EventBus';
import { Entity } from '../ecs/types';

/**
 * @class HealthSystem
 * @description Manages the health of entities, including checking for death and handling regeneration.
 * @extends SystemBase
 */
export class HealthSystem extends SystemBase {
    /**
     * Initializes a new instance of the HealthSystem.
     * It requires entities to have a HealthComponent.
     */
    constructor() {
        super([HealthComponent]);
    }

    /**
     * Updates all entities with a HealthComponent.
     * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
     * @param {EntityManager} entityManager - The entity manager instance.
     * @param {ComponentManager} componentManager - The component manager instance.
     */
    public update(deltaTime: number, entityManager: EntityManager, componentManager: ComponentManager): void {
        const entities = componentManager.getEntitiesWithComponents(this.requiredComponents);

        for (const entity of entities) {
            const health = componentManager.getComponent(entity, HealthComponent);

            if (health) {
                // 1. Death Check
                if (health.currentHealth <= 0) {
                    EventBus.getInstance().publish('entity:death', { entity });
                    this.deactivateAllComponents(entity, componentManager);
                    // Don't process regeneration for dead entities
                    continue; 
                }

                // 2. Regeneration
                if (health.currentHealth < health.maxHealth) {
                    // Simple regeneration: +1 HP per second
                    health.currentHealth += 1 * deltaTime;
                    // Clamp health to maxHealth
                    if (health.currentHealth > health.maxHealth) {
                        health.currentHealth = health.maxHealth;
                    }
                }
            }
        }
    }
    
    /**
     * Deactivates all components associated with a given entity.
     * @private
     * @param {Entity} entity - The entity whose components should be deactivated.
     * @param {ComponentManager} componentManager - The component manager instance.
     */
    private deactivateAllComponents(entity: Entity, componentManager: ComponentManager): void {
        // This is a workaround to access all component stores without a public API.
        const allStores = (componentManager as any).componentStores as Map<string, Map<Entity, any>>;
        
        allStores.forEach((store, componentName) => {
            if (store.has(entity)) {
                const component = store.get(entity);
                if (component && typeof component.isActive === 'boolean') {
                    component.isActive = false;
                }
            }
        });
    }
}