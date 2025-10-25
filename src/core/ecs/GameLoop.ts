import { SystemManager } from './SystemManager';

/**
 * @class GameLoop
 * @description Orchestrates the main game loop using requestAnimationFrame for smooth and efficient updates.
 */
export class GameLoop {
    private systemManager: SystemManager;
    // FIX: Renamed private property `isRunning` to `_isRunning` to be used with a public getter.
    private _isRunning: boolean = false;
    private animationFrameId: number = 0;
    private lastTime: number = 0;

    /**
     * Initializes a new instance of the GameLoop.
     * @param {SystemManager} systemManager - A reference to the SystemManager.
     */
    constructor(systemManager: SystemManager) {
        if (!systemManager) {
            throw new Error("[GameLoop] SystemManager cannot be null or undefined.");
        }
        this.systemManager = systemManager;
    }

    // FIX: Added a public getter for 'isRunning' to allow read-only access from outside the class, which resolves the error in index.tsx.
    /**
     * Gets a value indicating whether the game loop is currently running.
     * @returns {boolean} True if the loop is running, false otherwise.
     */
    public get isRunning(): boolean {
        return this._isRunning;
    }

    /**
     * The main update method that is called on each frame by requestAnimationFrame.
     * @private
     * @param {number} currentTime - The current timestamp provided by requestAnimationFrame.
     */
    private update = (currentTime: number) => {
        if (!this._isRunning) return;

        // Calculate delta time in seconds. Initialize lastTime if it's the first frame.
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
        }
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.systemManager.updateAll(deltaTime);

        this.animationFrameId = requestAnimationFrame(this.update);
    }
    
    /**
     * Starts the game loop if it is not already running.
     * It initializes the time for the first frame and requests the first animation frame.
     */
    public start(): void {
        if (this._isRunning) {
            console.warn('[GameLoop] Start called but loop is already running.');
            return;
        }
        this._isRunning = true;
        this.lastTime = 0; // Reset lastTime to correctly calculate deltaTime on the first frame.
        
        this.animationFrameId = requestAnimationFrame(this.update);
    }

    /**
     * Stops the game loop.
     */
    public stop(): void {
         if (!this._isRunning) {
            console.warn('[GameLoop] Stop called but loop is not running.');
            return;
         }
         this._isRunning = false;
         cancelAnimationFrame(this.animationFrameId);
    }
}