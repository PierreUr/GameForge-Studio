import { ComponentBase } from './ComponentBase';

/**
 * @class ScoreComponent
 * @description Represents the score points of an entity.
 * This can be used for player scores, enemy point values, or item scores.
 * Inherits from ComponentBase, providing the default `isActive` property.
 */
export class ScoreComponent extends ComponentBase {
    /**
     * The number of points associated with the entity.
     * @public
     * @type {number}
     */
    public points: number;

    /**
     * Initializes a new instance of the ScoreComponent.
     * @param {number} [points=0] - The initial number of points. Defaults to 0.
     */
    constructor(points: number = 0) {
        super();
        this.points = points;
    }
}
