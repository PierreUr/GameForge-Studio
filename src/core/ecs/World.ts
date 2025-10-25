import { EntityManager } from './EntityManager';
import { ComponentManager } from './ComponentManager';
import { SystemManager } from './SystemManager';
import { ComponentClass, Entity } from './types';
import { IComponent } from './Component';
import { EventBus } from './EventBus';

/**
 * @class World
 * @description Represents the entire ECS world, acting as a container and facade
 * for the core managers (EntityManager, ComponentManager, SystemManager).
 * This class provides high-level APIs to interact with the ECS, such as
 * saving and loading the project state.
 */
export class World {
    public entityManager: EntityManager;
    public componentManager: ComponentManager;
    public systemManager: SystemManager;
    public componentRegistry: Map<string, ComponentClass<any>> = new Map();
    public selectedEntity: Entity | null = null;

    /**
     * Initializes a new instance of the World.
     * @param {EntityManager} entityManager - The manager for entity lifecycle.
     * @param {ComponentManager} componentManager - The manager for component data.
     * @param {SystemManager} systemManager - The manager for system logic.
     */
    constructor(
        entityManager: EntityManager,
        componentManager: ComponentManager,
        systemManager: SystemManager
    ) {
        this.entityManager = entityManager;
        this.componentManager = componentManager;
        this.systemManager = systemManager;

        EventBus.getInstance().subscribe('entity:destroyed', (payload: { entityId: Entity }) => {
            if (this.selectedEntity === payload.entityId) {
                this.selectEntity(null);
            }
            // Ensure components are cleaned up when an entity is destroyed.
            this.componentManager.removeAllComponents(payload.entityId);
        });
    }
    
    /**
     * Registers a component class, allowing it to be reconstructed during deserialization.
     * @param {ComponentClass<any>} componentClass - The component class constructor to register.
     */
    public registerComponent(componentClass: ComponentClass<any>): void {
        const className = componentClass.name;
        if (this.componentRegistry.has(className)) {
            console.warn(`[World] Component type '${className}' is already registered.`);
            return;
        }
        this.componentRegistry.set(className, componentClass);
    }

    /**
     * Selects an entity and notifies the application by publishing an event.
     * Pass `null` to deselect the current entity.
     * @param {Entity | null} entityId - The ID of the entity to select, or null to deselect.
     */
    public selectEntity(entityId: Entity | null): void {
        if (entityId === null) {
            if (this.selectedEntity !== null) {
                this.selectedEntity = null;
                EventBus.getInstance().publish('entity:deselected');
            }
            return;
        }

        if (!this.entityManager.getActiveEntities().has(entityId)) {
            console.warn(`[World] Attempted to select non-existent entity with ID: ${entityId}`);
            if (this.selectedEntity !== null) {
                this.selectEntity(null); // Deselect current
            }
            return;
        }
        this.selectedEntity = entityId;
        EventBus.getInstance().publish('entity:selected', { entityId });
    }

    /**
     * Retrieves all components for a given entity.
     * @param {Entity} entityId - The ID of the entity.
     * @returns {[string, IComponent][]} An array of tuples containing the component name and instance.
     */
    public getComponentsForEntity(entityId: Entity): [string, IComponent][] {
        return this.componentManager.getComponentsForEntity(entityId);
    }

     /**
     * Retrieves the full serializable state of a single entity, including its ID and all its components.
     * @param {Entity} entityId - The ID of the entity to serialize.
     * @returns {any | null} A serializable object representing the entity's state, or null if the entity doesn't exist.
     */
    public getFullEntityState(entityId: Entity): any | null {
        if (!this.entityManager.getActiveEntities().has(entityId)) {
            return null;
        }
        const components = this.componentManager.getComponentsForEntity(entityId);
        const serializedComponents = components.map(([name, instance]) => {
            return { name, data: { ...instance } };
        });
        return {
            id: entityId,
            components: serializedComponents
        };
    }

    /**
     * Creates a new entity from a serialized state object.
     * This is primarily used for the Undo/Redo system.
     * @param {any} state - The serialized state of the entity.
     * @returns {Entity} The ID of the newly created entity.
     */
    public createEntityFromState(state: any): Entity {
        // NOTE: The ID from the state is ignored because the EntityManager will assign a new unique ID.
        // This is crucial for preventing ID collisions when undoing a deletion after new entities have been created.
        const newEntity = this.entityManager.createEntity();
        if (state.components && Array.isArray(state.components)) {
            for (const { name, data } of state.components) {
                const componentClass = this.componentRegistry.get(name);
                if (componentClass) {
                    const newComponent = new componentClass();
                    Object.assign(newComponent, data);
                    this.addComponentDirectly(newEntity, componentClass, newComponent);
                }
            }
        }
        return newEntity;
    }


    /**
     * Updates a single property of a component for a given entity.
     * @param {Entity} entityId The ID of the entity.
     * @param {string} componentName The name of the component class.
     * @param {string} propertyKey The name of the property to update.
     * @param {any} value The new value for the property.
     */
    public updateComponentData(entityId: Entity, componentName: string, propertyKey: string, value: any): void {
        this.componentManager.updateComponentData(entityId, componentName, propertyKey, value);
    }

    /**
     * Serializes the entire state of the ECS world into a JSON-friendly object.
     * This includes all active entities and their associated components.
     * @returns {object} A serializable object representing the project state.
     * The format is: `{ entities: [...], components: { componentType: [...] } }`.
     */
    public getProjectState(): object {
        try {
            const entities = Array.from(this.entityManager.getActiveEntities());
            const components = this.componentManager.serializeState();

            return {
                entities,
                components,
            };
        } catch (error) {
            console.error('[World] Failed to get project state:', error);
            throw new Error('Could not serialize project state.');
        }
    }

    /**
     * Loads the world state from a previously serialized project state object.
     * This will clear the current world state before loading the new one.
     * @param {any} state - The project state object to load. It must conform to the structure
     * created by `getProjectState`.
     */
    public loadProjectState(state: any): void {
        try {
            
            // 1. Clear existing state
            this.entityManager.reset();
            this.componentManager.reset();
            this.selectEntity(null); // Deselect any entity and notify UI

            // 2. Re-create entities
            if (state.entities && Array.isArray(state.entities)) {
                for (const entityId of state.entities) {
                    // This is a simplified approach. A more robust system might need to handle ID conflicts.
                    this.entityManager.createEntity(); 
                }
            }

            // 3. Re-create components
            if (state.components && typeof state.components === 'object') {
                for (const componentType in state.components) {
                    const componentClass = this.componentRegistry.get(componentType);
                    if (!componentClass) {
                        console.warn(`[World] Component type '${componentType}' is not registered and will be skipped during deserialization.`);
                        continue;
                    }

                    const componentDataArray = state.components[componentType];
                    for (const { entity, data } of componentDataArray) {
                        // Create a new instance and assign properties.
                        const newComponent = new componentClass();
                        Object.assign(newComponent, data);
                        // Using a private method to bypass the 'already has component' check
                        this.addComponentDirectly(entity, componentClass, newComponent);
                    }
                }
            }
        } catch (error) {
            console.error('[World] Failed to load project state:', error);
            throw new Error('Could not deserialize project state.');
        }
    }

    /**
     * A helper to add a pre-constructed component instance directly.
     * This is used internally by `loadProjectState` to avoid re-constructing components.
     * This method bypasses the standard `addComponent` checks.
     * @private
     */
    private addComponentDirectly<T extends IComponent>(
        entity: number,
        componentClass: ComponentClass<T>,
        componentInstance: T
    ): void {
        const componentType = componentClass.name;
        // This is a simplified internal method; we assume the store exists because
        // it would have been created by addComponent during normal operation, or
        // we can create it here if loading state into a truly empty manager.
        if (!(this.componentManager as any).componentStores.has(componentType)) {
            (this.componentManager as any).componentStores.set(componentType, new Map<number, IComponent>());
        }
        const store = (this.componentManager as any).componentStores.get(componentType)!;
        store.set(entity, componentInstance);
    }
}