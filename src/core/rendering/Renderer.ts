import * as PIXI from 'pixi.js';

/**
 * @interface GridConfig
 * @description Defines the configuration for the canvas grid.
 */
export interface GridConfig {
    isVisible: boolean;
    size: number;
    color1: number;
    color2: number;
}

/**
 * @interface FrameConfig
 * @description Defines the configuration for the device preview frame.
 */
export interface FrameConfig {
    isVisible: boolean;
    width: number;
    height: number;
    color: number;
    orientation: 'portrait' | 'landscape';
    autoHeight: boolean;
}


/**
 * @class Renderer
 * @description A singleton class that encapsulates the Pixi.js application and its core functionalities.
 * It manages the canvas, stage, camera controls, and grid overlay.
 */
export class Renderer {
    private static instance: Renderer;
    public app: PIXI.Application;
    public isInitialized: boolean = false;

    private isPanning = false;
    private lastPanPosition = { x: 0, y: 0 };
    private grid: PIXI.Graphics;
    private deviceFrame: PIXI.Graphics;
    private deviceLabel: PIXI.Text;
    
    private gridConfig: GridConfig = {
        isVisible: true,
        size: 100,
        color1: 0x444444,
        color2: 0x333333,
    };

    private frameConfig: FrameConfig = {
        isVisible: false,
        width: 1920,
        height: 1080,
        color: 0x00aaff,
        orientation: 'landscape',
        autoHeight: false,
    };

    private constructor() {
        this.app = new PIXI.Application();
        this.grid = new PIXI.Graphics();
        this.deviceFrame = new PIXI.Graphics();
        this.deviceLabel = new PIXI.Text({
            text: '',
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 18,
                fill: 0xffffff,
                align: 'left',
                stroke: { color: '#000000', width: 4, join: 'round' }
            }
        });
        // isInitialized is false by default
    }

    /**
     * Returns the singleton instance of the Renderer.
     * @returns {Renderer} The single instance of the Renderer.
     */
    public static getInstance(): Renderer {
        if (!Renderer.instance) {
            Renderer.instance = new Renderer();
        }
        return Renderer.instance;
    }

    /**
     * Initializes the Pixi.js application and appends its canvas to a container element.
     */
    public async init(container: HTMLElement, width: number, height: number) {
        if (this.isInitialized) {
            console.warn('[Renderer] Already initialized.');
            return;
        }
        
        await this.app.init({
            width,
            height,
            backgroundColor: 0x1a1a1a,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });
        container.appendChild(this.app.canvas);

        // Center the stage view
        this.app.stage.x = width / 2;
        this.app.stage.y = height / 2;

        this.app.stage.interactive = true;
        // Only listen for the start of an interaction on the stage itself
        this.app.stage.on('pointerdown', this.onDragStart);

        this.app.canvas.addEventListener('wheel', this.onZoom, { passive: false });
        // Prevent context menu on right-click to allow for panning
        this.app.canvas.addEventListener('contextmenu', e => e.preventDefault());


        this.grid.zIndex = -1; // Draw behind everything else
        this.grid.visible = this.gridConfig.isVisible;
        this.app.stage.addChild(this.grid);
        
        this.deviceFrame.zIndex = -0.5; // Between grid and entities
        this.deviceFrame.visible = this.frameConfig.isVisible;
        this.app.stage.addChild(this.deviceFrame);
        
        this.deviceLabel.zIndex = 10000; // Always on top
        this.deviceLabel.visible = this.frameConfig.isVisible;
        this.app.stage.addChild(this.deviceLabel);


        if (this.gridConfig.isVisible) {
            this.drawGrid();
        }
        if (this.frameConfig.isVisible) {
            this.drawDeviceFrame();
        }

        this.isInitialized = true;
    }

    public resize(width: number, height: number): void {
        if (!this.isInitialized) return;
        this.app.renderer.resize(width, height);
        
        // Recenter the stage
        this.app.stage.x = width / 2;
        this.app.stage.y = height / 2;
        
        if (this.gridConfig.isVisible) {
            this.drawGrid();
        }
        if (this.frameConfig.isVisible) {
            this.drawDeviceFrame();
        }
    }

    public setGridConfig(config: Partial<GridConfig>): void {
        Object.assign(this.gridConfig, config);
        this.grid.visible = this.gridConfig.isVisible;
        if (this.isInitialized && this.gridConfig.isVisible) {
            this.drawGrid();
        }
    }

    public setFrameConfig(config: Partial<FrameConfig>): void {
        const needsRedraw = this.frameConfig.isVisible !== config.isVisible ||
                            this.frameConfig.width !== config.width ||
                            this.frameConfig.height !== config.height ||
                            this.frameConfig.color !== config.color ||
                            this.frameConfig.orientation !== config.orientation ||
                            this.frameConfig.autoHeight !== config.autoHeight;
    
        Object.assign(this.frameConfig, config);
        this.deviceFrame.visible = this.frameConfig.isVisible;
        this.deviceLabel.visible = this.frameConfig.isVisible;
        if (this.isInitialized && needsRedraw) {
            this.drawDeviceFrame();
        }
    }

    private onDragStart = (event: PIXI.FederatedPointerEvent) => {
        // Middle mouse button (1) or Right mouse button (2)
        if (event.button === 1 || event.button === 2) {
            if (!this.isPanning) {
                this.isPanning = true;
                // Use global window events to track mouse movement anywhere on the page
                window.addEventListener('pointermove', this.onDragMove);
                window.addEventListener('pointerup', this.onDragEnd);
            }
            // FIX: Use clientX/Y from the native event to match the coordinate system
            // used in onDragMove. This prevents the "jump" on the first pan.
            this.lastPanPosition = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY };
            this.app.canvas.style.cursor = 'grabbing';
        }
    };

    private onDragEnd = (event: PointerEvent) => {
        if (this.isPanning) {
            this.isPanning = false;
            this.app.canvas.style.cursor = 'default';
            // Clean up the global listeners
            window.removeEventListener('pointermove', this.onDragMove);
            window.removeEventListener('pointerup', this.onDragEnd);
        }
    };

    private onDragMove = (event: PointerEvent) => {
        if (this.isPanning) {
            const dx = event.clientX - this.lastPanPosition.x;
            const dy = event.clientY - this.lastPanPosition.y;

            this.app.stage.pivot.x -= dx / this.app.stage.scale.x;
            this.app.stage.pivot.y -= dy / this.app.stage.scale.y;

            this.lastPanPosition = { x: event.clientX, y: event.clientY };
            if(this.gridConfig.isVisible) this.drawGrid();
            if(this.frameConfig.isVisible) this.drawDeviceFrame();
        }
    };
    
    private onZoom = (event: WheelEvent) => {
        event.preventDefault();
        if (!this.isInitialized) return;

        const zoomFactor = 1.1;
        const oldScale = this.app.stage.scale.x;
        const newScale = event.deltaY < 0 ? oldScale * zoomFactor : oldScale / zoomFactor;
        
        const pointer = new PIXI.Point(event.offsetX, event.offsetY);
        const worldPos = this.app.stage.toLocal(pointer);

        this.app.stage.scale.set(newScale);

        const newWorldPos = this.app.stage.toLocal(pointer);

        this.app.stage.pivot.x += (worldPos.x - newWorldPos.x);
        this.app.stage.pivot.y += (worldPos.y - newWorldPos.y);

        if(this.gridConfig.isVisible) this.drawGrid();
        if(this.frameConfig.isVisible) this.drawDeviceFrame();
    };

    private drawGrid = () => {
        if (!this.gridConfig.isVisible || !this.isInitialized) return;

        this.grid.clear();
        
        const scale = this.app.stage.scale.x;
        let gridSize = this.gridConfig.size;
        if (scale < 0.25) gridSize *= 4;
        else if (scale < 0.75) gridSize *= 2;
        else if (scale > 2) gridSize /= 2;
        
        const view = this.getViewBounds();

        const startX = Math.floor(view.x / gridSize);
        const endX = Math.ceil((view.x + view.width) / gridSize);
        const startY = Math.floor(view.y / gridSize);
        const endY = Math.ceil((view.y + view.height) / gridSize);
        
        const color1 = this.gridConfig.color1;
        const color2 = this.gridConfig.color2;

        for (let i = startX; i < endX; i++) {
            for (let j = startY; j < endY; j++) {
                const color = (i + j) % 2 === 0 ? color1 : color2;
                this.grid.rect(i * gridSize, j * gridSize, gridSize, gridSize).fill(color);
            }
        }
    }

    private drawDeviceFrame = () => {
        if (!this.frameConfig.isVisible || !this.isInitialized) {
            this.deviceLabel.visible = false;
            this.deviceFrame.visible = false;
            return;
        }

        this.deviceFrame.clear();
        this.deviceFrame.visible = true;
        this.deviceLabel.visible = true;
        
        // Scale border width to appear constant regardless of zoom
        const borderWidth = 4 / this.app.stage.scale.x;
        this.deviceFrame.stroke({ width: borderWidth, color: this.frameConfig.color });
        
        let width = this.frameConfig.width;
        let height = this.frameConfig.height;
    
        // Swap dimensions based on orientation
        if (this.frameConfig.orientation === 'portrait' && width > height) {
            [width, height] = [height, width];
        } else if (this.frameConfig.orientation === 'landscape' && height > width) {
            [width, height] = [height, width];
        }
    
        // Draw centered at world origin (0,0)
        this.deviceFrame.drawRect(-width / 2, -height / 2, width, height);
        
        // Update and position the label
        this.deviceLabel.text = `${this.frameConfig.orientation.charAt(0).toUpperCase() + this.frameConfig.orientation.slice(1)} (${width}x${height})`;
        
        const view = this.getViewBounds();
        this.deviceLabel.scale.set(1 / this.app.stage.scale.x);
        this.deviceLabel.x = view.x + (10 / this.app.stage.scale.x);
        this.deviceLabel.y = view.y + (10 / this.app.stage.scale.y);

    }

    public getViewBounds(): PIXI.Rectangle {
        if (!this.isInitialized) {
            return new PIXI.Rectangle(0, 0, 0, 0);
        }
        
        const topLeft = this.app.stage.toLocal(new PIXI.Point(0, 0));
        const width = this.app.screen.width / this.app.stage.scale.x;
        const height = this.app.screen.height / this.app.stage.scale.y;

        return new PIXI.Rectangle(topLeft.x, topLeft.y, width, height);
    }
}