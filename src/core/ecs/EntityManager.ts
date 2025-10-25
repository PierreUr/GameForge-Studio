/**
 * Represents a unique entity in the game world as a numerical ID.
 */
import { Entity } from './types';
import { EventBus } from './EventBus';

/**
 * @class EntityManager
 * @description Manages the lifecycle of entities (creation, destruction).
 * This base class provides the foundational structure for entity management.
 * Its functionality will be incrementally implemented in subsequent tasks.
 */
export class EntityManager {
    private nextEntityId: Entity = 0;
    private activeEntities: Set<Entity> = new Set();

    /**
     * Initializes a new instance of the EntityManager.
     */
    constructor() {
        // Core properties for entity tracking will be added later.
    }

    /**
     * Generates a new, unique entity ID using an auto-incrementing counter.
     * @returns {Entity} The newly generated entity ID.
     * @private
     */
    private generateNewEntityId(): Entity {
        return this.nextEntityId++;
    }

    /**
     * Creates a new entity, assigns it a unique ID, and registers it as active.
     * @returns {Entity} The ID of the newly created entity.
     */
    public createEntity(): Entity {
        try {
            const newEntity = this.generateNewEntityId();
            this.activeEntities.add(newEntity);
            return newEntity;
        } catch (error) {
            console.error("Error creating new entity:", error);
            throw new Error("Failed to create entity.");
        }
    }

    /**
     * Destroys an existing entity by removing it from the set of active entities.
     * @param {Entity} entity The ID of the entity to destroy.
     * @returns {boolean} True if the entity was successfully destroyed, false otherwise.
     */
    public destroyEntity(entity: Entity): boolean {
        if (!this.activeEntities.has(entity)) {
            console.warn(`[EntityManager] Attempted to destroy non-existent entity with ID: ${entity}`);
            return false;
        }

        try {
            this.activeEntities.delete(entity);
            EventBus.getInstance().publish('entity:destroyed', { entityId: entity });
            // Later, this will also trigger component cleanup.
            return true;
        } catch (error) {
            console.error(`Error destroying entity with ID ${entity}:`, error);
            throw new Error("Failed to destroy entity.");
        }
    }
    
    /**
     * Returns a set of all currently active entity IDs.
     * @returns {Set<Entity>} A set of active entity IDs.
     */
    public getActiveEntities(): Set<Entity> {
        return this.activeEntities;
    }

    /**
     * Resets the EntityManager to its initial state, clearing all entities.
     * This is essential for loading a new project state.
     */
    public reset(): void {
        this.activeEntities.clear();
        this.nextEntityId = 0;
    }
}