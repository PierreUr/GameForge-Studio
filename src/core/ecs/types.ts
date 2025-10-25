import { IComponent } from './Component';
// FIX: Import ISystem to define the SystemRegistration interface.
import { ISystem } from './ISystem';

/**
 * Represents a unique entity in the game world as a numerical ID.
 */
export type Entity = number;

/**
 * Represents the constructor of a component class.
 * This allows for type-safe operations on component classes.
 * @template T - The type of the component, which must extend IComponent.
 */
export type ComponentClass<T extends IComponent> = new (...args: any[]) => T;

// FIX: Added the missing 'SystemRegistration' interface, which was causing an import error in SystemManager.ts.
/**
 * Represents the registration of a system in the SystemManager.
 * It includes the system instance, its priority, and its active state.
 */
export interface SystemRegistration {
    /** The system instance. */
    system: ISystem;
    /** The priority of the system (higher numbers run first). */
    priority: number;
    /** A flag indicating whether the system is currently active and should be updated. */
    isActive: boolean;
}
