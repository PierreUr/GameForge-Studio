import { ICommand } from './ICommand';
import { EventBus } from '../ecs/EventBus';

/**
 * @class CommandManager
 * @description A singleton class that manages the execution, undoing, and redoing of commands.
 * It maintains a history of executed commands to provide undo/redo functionality.
 */
export class CommandManager {
    private static instance: CommandManager;

    private undoStack: ICommand[] = [];
    private redoStack: ICommand[] = [];

    private constructor() {
    }

    /**
     * Returns the singleton instance of the CommandManager.
     * @returns {CommandManager} The single instance of the CommandManager.
     */
    public static getInstance(): CommandManager {
        if (!CommandManager.instance) {
            CommandManager.instance = new CommandManager();
        }
        return CommandManager.instance;
    }

    /**
     * Executes a command, adds it to the undo stack, and clears the redo stack.
     * @param {ICommand} command - The command to execute.
     */
    public executeCommand(command: ICommand): void {
        try {
            command.execute();
            this.undoStack.push(command);
            // When a new command is executed, the redo history is invalidated.
            this.redoStack = []; 
            EventBus.getInstance().publish('command:executed');
        } catch (error) {
            console.error(`[CommandManager] Error executing command: ${command.constructor.name}`, error);
        }
    }

    /**
     * Undoes the most recent command.
     */
    public undo(): void {
        const command = this.undoStack.pop();
        if (command) {
            try {
                command.undo();
                this.redoStack.push(command);
                EventBus.getInstance().publish('command:executed');
            // FIX: Added curly braces to the catch block to correctly scope the error handling logic.
            } catch (error) {
                console.error(`[CommandManager] Error undoing command: ${command.constructor.name}`, error);
                // If undo fails, push it back to the undo stack to maintain state.
                this.undoStack.push(command);
            }
        }
    }

    /**
     * Redoes the most recently undone command.
     */
    public redo(): void {
        const command = this.redoStack.pop();
        if (command) {
            try {
                command.execute();
                this.undoStack.push(command);
                EventBus.getInstance().publish('command:executed');
            } catch (error) {
                console.error(`[CommandManager] Error redoing command: ${command.constructor.name}`, error);
                 // If redo fails, push it back to the redo stack.
                this.redoStack.push(command);
            }
        }
    }
}