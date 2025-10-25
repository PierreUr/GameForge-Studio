import { ICommand } from './ICommand';
import { World } from '../ecs/World';
import { Entity } from '../ecs/types';
import { TemplateManager } from '../library/TemplateManager';

/**
 * @class CreateEntityCommand
 * @description A command that encapsulates the action of creating a new entity from a template.
 * @implements {ICommand}
 */
export class CreateEntityCommand implements ICommand {
    private world: World;
    private templateName: string;
    private options: any;
    public entityId: Entity | null;

    /**
     * Initializes a new instance of the CreateEntityCommand.
     * @param {World} world - A reference to the ECS World.
     * @param {string} templateName - The name of the template to use for entity creation.
     * @param {any} options - An optional object with properties to override the template's defaults.
     */
    constructor(world: World, templateName: string, options: any) {
        this.world = world;
        this.templateName = templateName;
        this.options = options;
        this.entityId = null;
    }

    /**
     * Executes the command by creating the entity.
     */
    public execute(): void {
        const templateManager = new TemplateManager(this.world);
        const newEntity = templateManager.createEntityFromTemplate(this.templateName, this.options);
        if (newEntity !== undefined) {
            this.entityId = newEntity;
        }
    }

    /**
     * Undoes the command by destroying the created entity.
     */
    public undo(): void {
        if (this.entityId !== null) {
            this.world.entityManager.destroyEntity(this.entityId);
        }
    }
}
