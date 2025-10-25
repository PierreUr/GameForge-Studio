/**
 * @interface ICommand
 * @description Defines the contract for a command in the Command Pattern.
 * Each command encapsulates an action that can be executed and undone.
 */
export interface ICommand {
    /**
     * Executes the command's action.
     */
    execute(): void;

    /**
     * Reverts the command's action.
     */
    undo(): void;
}
