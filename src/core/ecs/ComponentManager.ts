import { Entity, ComponentClass } from './types';
import { IComponent } from './Component';

/**
 * @class ComponentManager
 * @description Manages components for all entities.
 * Responsible for adding, removing, and retrieving components.
 */
export class ComponentManager {
    /**
     * Stores all components, organized by component type (class name) and then by entity ID.
     * @private
     * @type {Map<string, Map<Entity, IComponent>>}
     * @example
     * {
     *   "PositionComponent": {
     *     1: { x: 10, y: 20, z: 0, isActive: true },
     *     2: { x: 5, y: 15, z: 0, isActive: true }
     *   },
     *   "VelocityComponent": {
     *     1: { vx: 1, vy: -1, isActive: true }
     *   }
     * }
     */
    private componentStores: Map<string, Map<Entity, IComponent>> = new Map();

    /**
     * Initializes a new instance of the ComponentManager.
     */
    constructor() {
        console.log('[ComponentManager] Initialized with componentStores Map.');
    }

    /**
     * Adds a component to an entity.
     * If the entity already has a component of this type, a warning is logged and the existing component is returned.
     * @template T - The type of the component, which must extend IComponent.
     * @param {Entity} entity - The ID of the entity to which the component will be added.
     * @param {ComponentClass<T>} componentClass - The constructor of the component to add.
     * @param {...any[]} args - The arguments for the component's constructor.
     * @returns {T} The newly created (or existing) component instance.
     * @throws {Error} If the component fails to be instantiated.
     */
    public addComponent<T extends IComponent>(
        entity: Entity,
        componentClass: ComponentClass<T>,
        ...args: any[]
    ): T {
        const componentType = componentClass.name;

        // Ensure a store for this component type exists.
        if (!this.componentStores.has(componentType)) {
            this.componentStores.set(componentType, new Map<Entity, IComponent>());
        }

        const store = this.componentStores.get(componentType)!;

        // Check if the entity already has this component.
        if (store.has(entity)) {
            console.warn(`[ComponentManager] Entity ${entity} already has component ${componentType}. Returning existing instance.`);
            return store.get(entity) as T;
        }

        try {
            // Create and add the new component.
            const newComponent = new componentClass(...args);
            store.set(entity, newComponent);
            console.log(`[ComponentManager] Added component ${componentType} to entity ${entity}.`);
            return newComponent;
        } catch (error) {
            console.error(`Error adding component ${componentType} to entity ${entity}:`, error);
            throw new Error(`Failed to add component ${componentType}.`);
        }
    }

    /**
     * Retrieves a component of a specific type from an entity.
     * @template T - The type of the component to retrieve.
     * @param {Entity} entity - The ID of the entity.
     * @param {ComponentClass<T>} componentClass - The class of the component to retrieve.
     * @returns {T | undefined} The component instance if found, otherwise undefined.
     */
    public getComponent<T extends IComponent>(
        entity: Entity,
        componentClass: ComponentClass<T>
    ): T | undefined {
        const componentType = componentClass.name;
        const store = this.componentStores.get(componentType);

        if (!store) {
            return undefined;
        }

        return store.get(entity) as T | undefined;
    }

    /**
     * Removes a component of a specific type from an entity.
     * @template T - The type of the component to remove.
     * @param {Entity} entity - The ID of the entity.
     * @param {ComponentClass<T>} componentClass - The class of the component to remove.
     * @returns {boolean} True if the component was successfully removed, false otherwise.
     */
    public removeComponent<T extends IComponent>(
        entity: Entity,
        componentClass: ComponentClass<T>
    ): boolean {
        const componentType = componentClass.name;
        const store = this.componentStores.get(componentType);

        if (!store || !store.has(entity)) {
            console.warn(`[ComponentManager] Component ${componentType} not found on entity ${entity}. Cannot remove.`);
            return false;
        }

        const success = store.delete(entity);
        if (success) {
            console.log(`[ComponentManager] Removed component ${componentType} from entity ${entity}.`);
        }
        return success;
    }

    /**
     * Removes all components associated with a given entity.
     * @param {Entity} entity - The ID of the entity to clean up.
     */
    public removeAllComponents(entity: Entity): void {
        for (const store of this.componentStores.values()) {
            store.delete(entity);
        }
        console.log(`[ComponentManager] Removed all components from entity ${entity}.`);
    }

    /**
     * Toggles the 'isActive' state of a component on an entity, or forces it to a specific state.
     * @template T The type of the component.
     * @param {Entity} entity The ID of the entity.
     * @param {ComponentClass<T>} componentClass The class of the component to toggle.
     * @param {boolean} [forceState] - If provided, sets the isActive state to this value instead of toggling.
     * @returns {boolean} True if the component was found and its state was changed, false otherwise.
     */
    public toggleComponent<T extends IComponent>(
        entity: Entity,
        componentClass: ComponentClass<T>,
        forceState?: boolean
    ): boolean {
        const component = this.getComponent(entity, componentClass);

        if (!component) {
            console.warn(`[ComponentManager] Component ${componentClass.name} not found on entity ${entity}. Cannot toggle.`);
            return false;
        }

        try {
            const originalState = component.isActive;
            component.isActive = forceState !== undefined ? forceState : !component.isActive;
            
            if (originalState !== component.isActive) {
                 console.log(`[ComponentManager] Toggled component ${componentClass.name} on entity ${entity} to isActive: ${component.isActive}.`);
                 return true;
            }
            return false; // State was not changed
        } catch (error) {
            console.error(`Error toggling component ${componentClass.name} on entity ${entity}:`, error);
            throw new Error(`Failed to toggle component ${componentClass.name}.`);
        }
    }
    
    /**
     * Retrieves a set of entities that have all of the specified components, and all those components are active.
     * @param {ComponentClass<IComponent>[]} componentClasses - An array of component classes to query for.
     * @returns {Set<Entity>} A set of entity IDs that match the query.
     */
    public getEntitiesWithComponents(componentClasses: ComponentClass<IComponent>[]): Set<Entity> {
        if (componentClasses.length === 0) {
            return new Set<Entity>();
        }
    
        // Find the component store with the fewest entities to optimize the search
        let smallestStore: Map<Entity, IComponent> | undefined = undefined;
        let smallestStoreSize = Infinity;
        for (const componentClass of componentClasses) {
            const store = this.componentStores.get(componentClass.name);
            if (!store) { // If any component type doesn't exist, no entities can match.
                return new Set<Entity>();
            }
            if (store.size < smallestStoreSize) {
                smallestStore = store;
                smallestStoreSize = store.size;
            }
        }
    
        if (!smallestStore) {
            return new Set<Entity>();
        }
    
        const matchingEntities = new Set<Entity>();
    
        // Iterate through the smallest set of entities and check if they have all other required and active components.
        for (const [entityId, component] of smallestStore.entries()) {
            // Initial check for the component from the smallest store
            if (!component.isActive) {
                continue;
            }
    
            let hasAllActiveComponents = true;
            for (const componentClass of componentClasses) {
                const store = this.componentStores.get(componentClass.name);
                const componentInstance = store?.get(entityId);
    
                if (!componentInstance || !componentInstance.isActive) {
                    hasAllActiveComponents = false;
                    break;
                }
            }
    
            if (hasAllActiveComponents) {
                matchingEntities.add(entityId);
            }
        }
    
        return matchingEntities;
    }

    /**
     * Retrieves all components associated with a given entity.
     * @param {Entity} entity The ID of the entity.
     * @returns {[string, IComponent][]} An array of tuples, where each tuple contains the component name and the component instance.
     */
    public getComponentsForEntity(entity: Entity): [string, IComponent][] {
        const components: [string, IComponent][] = [];
        for (const [componentType, store] of this.componentStores.entries()) {
            if (store.has(entity)) {
                components.push([componentType, store.get(entity)!]);
            }
        }
        return components;
    }

    /**
     * Updates a single property of a component for a given entity.
     * @param {Entity} entity The ID of the entity.
     * @param {string} componentName The name of the component class.
     * @param {string} propertyKey The name of the property to update.
     * @param {any} value The new value for the property.
     * @returns {boolean} True if the component was found and updated, false otherwise.
     */
    public updateComponentData(entity: Entity, componentName: string, propertyKey: string, value: any): boolean {
        const store = this.componentStores.get(componentName);
        if (!store) {
            console.warn(`[ComponentManager] Component store for '${componentName}' not found.`);
            return false;
        }

        const component = store.get(entity);
        if (!component) {
            console.warn(`[ComponentManager] Component '${componentName}' not found on entity ${entity}.`);
            return false;
        }

        if (propertyKey in component) {
            try {
                (component as any)[propertyKey] = value;
                console.log(`[ComponentManager] Updated ${componentName}.${propertyKey} for entity ${entity} to:`, value);
                return true;
            } catch (error) {
                console.error(`[ComponentManager] Error updating property '${propertyKey}' on component '${componentName}' for entity ${entity}:`, error);
                return false;
            }
        } else {
            console.warn(`[ComponentManager] Property '${propertyKey}' not found on component '${componentName}'.`);
            return false;
        }
    }

    /**
     * Serializes the state of all components into a JSON-friendly object.
     * @returns {Record<string, { entity: Entity, data: any }[]>} An object where keys are component names
     * and values are arrays of component data associated with an entity ID.
     */
    public serializeState(): Record<string, { entity: Entity, data: any }[]> {
        const serializedState: Record<string, { entity: Entity, data: any }[]> = {};

        for (const [componentType, store] of this.componentStores.entries()) {
            serializedState[componentType] = [];
            for (const [entityId, componentInstance] of store.entries()) {
                // Simple serialization: convert class instance to a plain data object.
                // This assumes component properties are public and serializable.
                const componentData = { ...componentInstance };
                serializedState[componentType].push({
                    entity: entityId,
                    data: componentData,
                });
            }
        }
        return serializedState;
    }
    
    /**
     * Resets the ComponentManager to its initial state, clearing all component data.
     * This is essential for loading a new project state.
     */
    public reset(): void {
        this.componentStores.clear();
        console.log('[ComponentManager] State has been reset.');
    }
}