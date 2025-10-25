import { IComponent } from '../ecs/Component';

/**
 * @abstract
 * @class ComponentBase
 * @description An abstract base class for all game-specific components.
 * It implements the IComponent interface, providing a default `isActive` property.
 * All concrete components in the library should extend this class.
 */
export abstract class ComponentBase implements IComponent {
    /**
     * A flag indicating whether the component is currently active and should be processed by systems.
     * @public
     * @type {boolean}
     */
    public isActive: boolean;

    /**
     * Initializes a new instance of the ComponentBase class.
     * Sets the component to be active by default.
     */
    constructor() {
        this.isActive = true;
    }
}
