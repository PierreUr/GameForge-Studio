import { ComponentBase } from './ComponentBase';

/**
 * @class PlayerInputComponent
 * @description Manages key bindings for a player-controlled entity.
 * It maps keyboard inputs (like 'w', 'ArrowUp') to game actions (like 'move_up').
 * Inherits from ComponentBase.
 */
export class PlayerInputComponent extends ComponentBase {
    /**
     * A map where the key is the keyboard input (e.g., 'w', ' ') and the value
     * is the action to be triggered (e.g., 'move_up', 'jump').
     * @public
     * @type {Map<string, string>}
     */
    public keyBindings: Map<string, string>;

    /**
     * Initializes a new instance of the PlayerInputComponent.
     * @param {Map<string, string>} [initialBindings] - An optional map of initial key bindings.
     * Defaults to an empty map.
     */
    constructor(initialBindings: Map<string, string> = new Map()) {
        super();
        this.keyBindings = initialBindings;
    }
}
