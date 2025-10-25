# Developer Toolbox - GameForge Studio

## Test-Utilities

### Logging-Helper
/**
 * @class TestLogger
 * @description Provides standardized methods for logging test results and returning a formatted string for UI display.
 */
export class TestLogger {
    private logOutput: string = '';

    /**
     * Logs a success message for a given task.
     * @param {string} taskSlug - The slug of the task that succeeded.
     */
    public logSuccess(taskSlug: string): void {
        const message = `[SUCCESS] ${taskSlug} produced the expected outcome.\n`;
        this.logOutput += `\x1b[32m${message}\x1b[0m`; // Green
    }

    /**
     * Logs a failure message for a given task, indicating that an error was handled correctly.
     * @param {string} taskSlug - The slug of the task whose error handling is being tested.
     */
    public logFailure(taskSlug: string): void {
        const message = `[FAILURE] ${taskSlug} correctly handled invalid input (simulation).\n`;
        this.logOutput += `\x1b[33m${message}\x1b[0m`; // Yellow
    }

    /**
     * Logs a custom informational message.
     * @param {string} customMessage - The message to log.
     * @param {'INFO' | 'WARN' | 'ERROR'} type - The type of the message.
     */
    public logCustom(customMessage: string, type: 'INFO' | 'WARN' | 'ERROR' = 'INFO'): void {
        const message = `[${type}] ${customMessage}\n`;
        this.logOutput += `\x1b[36m${message}\x1b[0m`; // Cyan
    }
    
    /**
     * Returns the accumulated log string.
     * @returns {string} The complete log output.
     */
    public getLog(): string {
        const tempLog = this.logOutput;
        this.logOutput = ''; // Clear log after getting it
        return tempLog;
    }
}


### ECS Test-Helpers
export class ECSTestHelper {
  static createMockEntity(id: number, components: Component[]): Entity {
    return { id, components: new Map(components.map(c => [c.constructor.name, c])) };
  }
}