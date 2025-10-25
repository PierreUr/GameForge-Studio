import { Entity } from '../ecs/types';

/**
 * @class ExecutionContext
 * @description A data container that flows through the graph during execution.
 * It holds the current scope (e.g., the entity that triggered the event)
 * and stores data output by nodes.
 */
export class ExecutionContext {
    /**
     * The ID of the primary entity this execution context is scoped to.
     * For example, in a collision event, this might be one of the colliding entities.
     * @public
     * @readonly
     */
    public readonly entityScope: Entity;

    /**
     * A map to store arbitrary data produced by nodes during execution.
     * The key is typically a unique identifier for the data (e.g., a port ID).
     * @private
     */
    private data: Map<string, any> = new Map();

    /**
     * Initializes a new instance of the ExecutionContext.
     * @param {Entity} entityScope - The entity ID to scope this context to.
     */
    constructor(entityScope: Entity) {
        this.entityScope = entityScope;
    }

    /**
     * Stores a value in the context's data map.
     * @param {string} key - The key to store the data under.
     * @param {any} value - The value to store.
     */
    public setData(key: string, value: any): void {
        this.data.set(key, value);
    }

    /**
     * Retrieves a value from the context's data map.
     * @param {string} key - The key of the data to retrieve.
     * @returns {any | undefined} The stored value, or undefined if the key is not found.
     */
    public getData(key: string): any | undefined {
        return this.data.get(key);
    }
}