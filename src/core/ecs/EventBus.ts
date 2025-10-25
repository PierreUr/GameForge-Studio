/**
 * A type alias for the callback functions that listen to events.
 * Can receive any number of arguments of any type.
 */
// FIX: Updated EventCallback to allow async functions that return a Promise.
export type EventCallback = (...args: any[]) => void | Promise<void>;

/**
 * @class EventBus
 * @description A singleton class for handling global event subscription and publication.
 * This ensures a single, central point for event communication throughout the application.
 */
export class EventBus {
    private static instance: EventBus;
    
    /**
     * The core data structure for storing event listeners.
     * It maps an event name (string) to a Set of callback functions.
     * Using a Set ensures that the same callback is not registered multiple times for the same event.
     * @private
     * @type {Map<string, Set<EventCallback>>}
     */
    private listeners: Map<string, Set<EventCallback>> = new Map();

    /**
     * The constructor is private to enforce the singleton pattern.
     * Use EventBus.getInstance() to get the singleton instance.
     * @private
     */
    private constructor() {
        if (EventBus.instance) {
            throw new Error("Error: Instantiation failed: Use EventBus.getInstance() instead of new.");
        }
    }

    /**
     * Returns the singleton instance of the EventBus.
     * If an instance doesn't exist, it is created.
     * @returns {EventBus} The single instance of the EventBus.
     */
    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    /**
     * Subscribes a callback function to a specific event.
     * @param {string} event - The name of the event to subscribe to (e.g., 'entity:created').
     * @param {EventCallback} callback - The function to be executed when the event is published.
     */
    public subscribe(event: string, callback: EventCallback): void {
        try {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, new Set<EventCallback>());
            }
            const eventListeners = this.listeners.get(event)!;
            eventListeners.add(callback);
        } catch (error) {
            console.error(`[EventBus] Error subscribing to event "${event}":`, error);
        }
    }

    // FIX: Implemented the missing 'unsubscribe' method to fix the error in index.tsx.
    /**
     * Unsubscribes a callback function from a specific event.
     * @param {string} event - The name of the event to unsubscribe from.
     * @param {EventCallback} callback - The specific callback function to remove.
     */
    public unsubscribe(event: string, callback: EventCallback): void {
        try {
            const eventListeners = this.listeners.get(event);

            if (!eventListeners) {
                console.warn(`[EventBus] Attempted to unsubscribe from non-existent event: ${event}`);
                return;
            }

            const wasDeleted = eventListeners.delete(callback);

            if (wasDeleted) {
                // If no listeners remain for this event, clean up the map entry.
                if (eventListeners.size === 0) {
                    this.listeners.delete(event);
                }
            } else {
                console.warn(`[EventBus] Attempted to unsubscribe a callback that was not registered for event: ${event}`);
            }
        } catch (error) {
            console.error(`[EventBus] Error unsubscribing from event "${event}":`, error);
        }
    }

    // FIX: Implemented the missing 'publish' method to resolve the error in index.tsx.
    /**
     * Publishes an event to all subscribed listeners synchronously.
     * If a listener throws an error, it is caught and logged, and the next listener is still executed.
     * @param {string} event - The name of the event to publish.
     * @param {...any[]} args - The arguments to pass to the event listeners.
     */
    public publish(event: string, ...args: any[]): void {
        const eventListeners = this.listeners.get(event);

        if (!eventListeners) {
            return; // No listeners for this event.
        }

        eventListeners.forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`[EventBus] Error in listener for event "${event}":`, error);
            }
        });
    }

    // FIX: Implemented the missing 'publishAsync' method to resolve the error in index.tsx.
    /**
     * Publishes an event to all subscribed listeners asynchronously.
     * This method waits for all async listeners (those returning a Promise) to complete.
     * If a listener throws an error (sync or async), it is caught and logged, and processing continues.
     * @param {string} event - The name of the event to publish.
     * @param {...any[]} args - The arguments to pass to the event listeners.
     * @returns {Promise<void>} A promise that resolves when all listeners have been executed.
     */
    public async publishAsync(event: string, ...args: any[]): Promise<void> {
        const eventListeners = this.listeners.get(event);

        if (!eventListeners) {
            return; // No listeners for this event.
        }
        
        const listenerPromises: Promise<any>[] = [];

        eventListeners.forEach(callback => {
            try {
                const result = callback(...args);
                // If the callback returns a promise, add it to our list to await.
                if (result instanceof Promise) {
                    listenerPromises.push(result);
                }
            } catch (error) {
                console.error(`[EventBus] Error in listener for event "${event}":`, error);
            }
        });
        
        // Wait for all promises to settle, logging any that are rejected.
        await Promise.all(listenerPromises.map(p => p.catch(error => {
            console.error(`[EventBus] Error in async listener for event "${event}":`, error);
        })));
    }
}