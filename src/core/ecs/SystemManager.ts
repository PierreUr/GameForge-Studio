import { EntityManager } from './EntityManager';
import { ComponentManager } from './ComponentManager';
import { ISystem } from './ISystem';
import { SystemRegistration } from './types';

/**
 * @class SystemManager
 * @description Manages all systems in the ECS, including their registration, ordering, and execution.
 */
export class SystemManager {
    private systems: SystemRegistration[] = [];
    private entityManager: EntityManager;
    private componentManager: ComponentManager;
    private nextSystemId: number = 0;

    /**
     * Tracks the number of consecutive errors for each system using a unique ID.
     * @private
     * @type {Map<number, number>}
     */
    private systemErrorCounts: Map<number, number> = new Map();
    private readonly ERROR_THRESHOLD = 10;

    constructor(entityManager: EntityManager, componentManager: ComponentManager) {
        this.entityManager = entityManager;
        this.componentManager = componentManager;
        console.log('[SystemManager] Initialized.');
    }

    /**
     * Registers a new system with a given priority. Assigns a unique ID to the system instance
     * for robust tracking. Systems are sorted by priority.
     * @param {ISystem} system - The system instance to register.
     * @param {number} [priority=0] - The priority of the system (higher numbers run first).
     * @returns {boolean} True if registration is successful, false if the instance is already registered.
     */
    public registerSystem(system: ISystem, priority: number = 0): boolean {
        const systemExists = this.systems.some(reg => reg.system === system);

        if (systemExists) {
            console.warn(`[SystemManager] This exact system instance of type ${system.constructor.name} is already registered.`);
            return false;
        }

        // Assign a unique, internal ID to the system instance for reliable tracking.
        (system as any)._id = this.nextSystemId++;

        const registration: SystemRegistration = {
            system,
            priority,
            isActive: true,
        };

        this.systems.push(registration);
        this.systems.sort((a, b) => b.priority - a.priority); 

        console.log(`[SystemManager] Registered system ${system.constructor.name} with priority ${priority}.`);
        return true;
    }

    /**
     * Unregisters a system instance, removing it from the update loop.
     * @param {ISystem} system - The system instance to unregister.
     * @returns {boolean} True if the system was found and removed, false otherwise.
     */
    public unregisterSystem(system: ISystem): boolean {
        const initialLength = this.systems.length;
        
        this.systems = this.systems.filter(reg => reg.system !== system);

        if (this.systems.length < initialLength) {
            console.log(`[SystemManager] Unregistered system ${system.constructor.name}.`);
            // Clean up error count for the unregistered system
            if ((system as any)._id !== undefined) {
                this.systemErrorCounts.delete((system as any)._id);
            }
            return true;
        } else {
            console.warn(`[SystemManager] System instance of type ${system.constructor.name} not found. Cannot unregister.`);
            return false;
        }
    }

    /**
     * Toggles the 'isActive' state of a registered system instance.
     * @param {ISystem} system - The system instance to toggle.
     * @param {boolean} [forceState] - If provided, sets the isActive state to this value.
     * @returns {boolean | undefined} The new state if successful, otherwise undefined.
     */
    public toggleSystem(system: ISystem, forceState?: boolean): boolean | undefined {
        const registration = this.systems.find(reg => reg.system === system);

        if (!registration) {
            console.warn(`[SystemManager] System instance of type ${system.constructor.name} not found. Cannot toggle.`);
            return undefined;
        }
        
        const originalState = registration.isActive;
        registration.isActive = forceState !== undefined ? forceState : !registration.isActive;
        
        if (originalState !== registration.isActive) {
             console.log(`[SystemManager] Toggled system ${system.constructor.name} to isActive: ${registration.isActive}.`);
        }
        return registration.isActive;
    }

    /**
     * Updates all active systems. If a system fails repeatedly, it will be automatically disabled.
     * This version includes detailed logging to debug the auto-disable mechanism.
     * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
     */
    public updateAll(deltaTime: number): void {
        for (const registration of this.systems) {
            if (registration.isActive) {
                const system = registration.system;
                const systemName = system.constructor.name;
                const systemId = (system as any)._id;

                if (systemId === undefined) {
                     console.warn(`System ${systemName} is active but is missing a unique ID. Skipping.`);
                    continue;
                }

                try {
                    system.update(deltaTime, this.entityManager, this.componentManager);
                    // On success, reset its error count if it had any.
                    if (this.systemErrorCounts.has(systemId)) {
                        this.systemErrorCounts.set(systemId, 0);
                    }
                } catch (error) {
                    const currentErrors = (this.systemErrorCounts.get(systemId) || 0) + 1;
                    this.systemErrorCounts.set(systemId, currentErrors);
                    
                    // Use a unique message format to ensure we know this catch block is being executed.
                    console.error(`[SystemManager CATCH] Error in ${systemName} (ID: ${systemId}). Count: ${currentErrors}/${this.ERROR_THRESHOLD}. Message: ${(error as Error).message}`);

                    if (currentErrors >= this.ERROR_THRESHOLD) {
                        registration.isActive = false;
                        // Use a simple, non-formatted console.warn for max compatibility.
                        console.warn(`[SystemManager] System ${systemName} (ID: ${systemId}) has been DISABLED due to repeated errors.`);
                        this.systemErrorCounts.delete(systemId);
                    }
                }
            }
        }
    }
}