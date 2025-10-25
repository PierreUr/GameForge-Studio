import { ComponentBase } from './ComponentBase';

/**
 * @class SpriteComponent
 * @description Represents the visual sprite of an entity.
 * It holds information about the texture (image) to be rendered,
 * as well as its dimensions.
 * Inherits from ComponentBase, providing the default `isActive` property.
 */
export class SpriteComponent extends ComponentBase {
    /**
     * The identifier or path for the texture/image asset to be rendered.
     * @public
     * @type {string}
     */
    public texture: string;

    /**
     * The width of the sprite.
     * @public
     * @type {number}
     */
    public width: number;

    /**
     * The height of the sprite.
     * @public
     * @type {number}
     */
    public height: number;

    /**
     * Initializes a new instance of the SpriteComponent.
     * @param {string} [texture=''] - The texture identifier. Defaults to an empty string.
     * @param {number} [width=0] - The width of the sprite. Defaults to 0.
     * @param {number} [height=0] - The height of the sprite. Defaults to 0.
     */
    constructor(texture: string = '', width: number = 0, height: number = 0) {
        super();
        this.texture = texture;
        this.width = width;
        this.height = height;
    }
}