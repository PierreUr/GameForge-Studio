import { ICommand } from './ICommand';
import { World } from '../ecs/World';
import { Entity } from '../ecs/types';

/**
 * @class UpdateComponentCommand
 * @description A command that encapsulates the action of updating a component's property.
 * It stores the old and new values to allow for undoing the change.
 * @implements {ICommand}
 */
export class UpdateComponentCommand implements ICommand {
    private world: World;
    private entityId: Entity;
    private componentName: string;
    private propertyKey: string;
    private oldValue: any;
    private newValue: any;

    /**
     * Initializes a new instance of the UpdateComponentCommand.
     * @param {World} world - A reference to the ECS World.
     * @param {Entity} entityId - The ID of the entity being modified.
     * @param {string} componentName - The name of the component being modified.
     * @param {string} propertyKey - The name of the property being changed.
     * @param {any} oldValue - The original value of the property.
     * @param {any} newValue - The new value for the property.
     */
    constructor(
        world: World,
        entityId: Entity,
        componentName: string,
        propertyKey: string,
        oldValue: any,
        newValue: any
    ) {
        this.world = world;
        this.entityId = entityId;
        this.componentName = componentName;
        this.propertyKey = propertyKey;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    /**
     * Executes the command by applying the new value to the component property.
     */
    public execute(): void {
        this.world.updateComponentData(this.entityId, this.componentName, this.propertyKey, this.newValue);
    }

    /**
     * Undoes the command by restoring the old value to the component property.
     */
    public undo(): void {
        this.world.updateComponentData(this.entityId, this.componentName, this.propertyKey, this.oldValue);
    }
}
