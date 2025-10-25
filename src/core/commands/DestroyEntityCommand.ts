import { ICommand } from './ICommand';
import { World } from '../ecs/World';
import { Entity } from '../ecs/types';

/**
 * @class DestroyEntityCommand
 * @description A command that encapsulates the action of destroying an entity.
 * It stores the entity's state to allow for undoing the deletion.
 * @implements {ICommand}
 */
export class DestroyEntityCommand implements ICommand {
    private world: World;
    private entityId: Entity;
    private entityState: any;
    private restoredEntityId: Entity | null = null; // To track the ID upon restoration

    /**
     * Initializes a new instance of the DestroyEntityCommand.
     * @param {World} world - A reference to the ECS World.
     * @param {Entity} entityId - The ID of the entity to be destroyed.
     */
    constructor(world: World, entityId: Entity) {
        this.world = world;
        this.entityId = entityId;
        // Capture the full state of the entity before it's destroyed.
        this.entityState = this.world.getFullEntityState(this.entityId);
    }

    /**
     * Executes the command by destroying the entity.
     */
    public execute(): void {
        // If we are redoing, we need to destroy the restored entity, not the original.
        const targetId = this.restoredEntityId !== null ? this.restoredEntityId : this.entityId;
        
        if (this.entityState) {
            this.world.entityManager.destroyEntity(targetId);
        }
    }

    /**
     * Undoes the command by re-creating the entity from its stored state.
     */
    public undo(): void {
        if (this.entityState) {
            // Re-create the entity from the saved state. This will assign a new ID.
            this.restoredEntityId = this.world.createEntityFromState(this.entityState);
        }
    }
}
