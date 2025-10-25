import { SystemBase } from './SystemBase';
import { EventBus } from '../ecs/EventBus';
import { GraphInterpreter } from '../graph/GraphInterpreter';
import { Graph } from '../graph/Graph';

/**
 * @class LogicSystem
 * @description Acts as the bridge between the core ECS EventBus and the GraphInterpreter.
 * It listens for global game events and triggers the execution of the logic graph.
 * @extends SystemBase
 */
export class LogicSystem extends SystemBase {
    private interpreter: GraphInterpreter;
    private graph: Graph;

    /**
     * Initializes a new instance of the LogicSystem.
     * @param {Graph} graph - The main logic graph.
     * @param {GraphInterpreter} interpreter - The runtime interpreter for the graph.
     */
    constructor(graph: Graph, interpreter: GraphInterpreter) {
        super([]); // This system is purely event-driven.
        this.graph = graph;
        this.interpreter = interpreter;
        this.subscribeToEvents();
    }

    /**
     * Subscribes to relevant game events from the EventBus.
     * @private
     */
    private subscribeToEvents(): void {
        const eventBus = EventBus.getInstance();
        eventBus.subscribe('collision:detected', this.handleCollision);
        // Future subscriptions (e.g., for key presses) will go here.
    }

    /**
     * The update method is empty as this system is purely event-driven.
     */
    public update(): void {
        // No logic needed here.
    }

    private handleCollision = (payload: { entityA: number, entityB: number }): void => {
        // Map the ECS event to the graph interpreter's execution method.
        this.interpreter.executeEvent('OnCollision', payload);
    };
}