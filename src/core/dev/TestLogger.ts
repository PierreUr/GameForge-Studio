/**
 * @class TestLogger
 * @description Provides standardized methods for logging test results to the console and returning a formatted string.
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
     * Logs a custom informational message with appropriate color coding.
     * @param {string} customMessage - The message to log.
     * @param {'INFO' | 'WARN' | 'ERROR'} type - The type of the message.
     */
    public logCustom(customMessage: string, type: 'INFO' | 'WARN' | 'ERROR' = 'INFO'): void {
        const colorCodeMap = {
            INFO: '36m',  // Cyan
            WARN: '33m',  // Yellow
            ERROR: '31m' // Red
        };
        const color = colorCodeMap[type] || colorCodeMap.INFO;
        const message = `[${type}] ${customMessage}\n`;
        this.logOutput += `\x1b[${color}${message}\x1b[0m`;
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