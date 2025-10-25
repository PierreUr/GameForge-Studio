/**
 * Base interface for all components.
 * Components are data containers that add properties to entities.
 */
export interface IComponent {
    /**
     * A flag indicating whether the component is currently active and should be processed by systems.
     */
    isActive: boolean;
}
