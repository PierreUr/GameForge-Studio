import { ComponentBase } from './ComponentBase';

/**
 * @interface IWaypoint
 * @description Defines the structure for a single waypoint with x and y coordinates.
 */
export interface IWaypoint {
    x: number;
    y: number;
}

/**
 * @class AIPatrolComponent
 * @description Manages AI patrolling behavior for an entity.
 * It defines a series of waypoints for the entity to follow and the speed at which it moves.
 * Inherits from ComponentBase.
 */
export class AIPatrolComponent extends ComponentBase {
    /**
     * An array of waypoints that define the patrol path for the AI entity.
     * Each waypoint is an object with x and y coordinates.
     * @public
     * @type {IWaypoint[]}
     */
    public waypoints: IWaypoint[];

    /**
     * The speed at which the AI entity moves between waypoints.
     * @public
     * @type {number}
     */
    public speed: number;
    
    /**
     * The index of the current waypoint in the waypoints array that the entity is moving towards.
     * @public
     * @type {number}
     */
    public currentWaypointIndex: number;


    /**
     * Initializes a new instance of the AIPatrolComponent.
     * @param {IWaypoint[]} [waypoints=[]] - The initial array of waypoints. Defaults to an empty array.
     * @param {number} [speed=1] - The movement speed of the AI. Defaults to 1.
     */
    constructor(waypoints: IWaypoint[] = [], speed: number = 1) {
        super();
        this.waypoints = waypoints;
        this.speed = speed;
        this.currentWaypointIndex = 0;
    }
}