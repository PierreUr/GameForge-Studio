import * as PIXI from 'pixi.js';

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
    private isGridVisible = false;

    private constructor() {
        this.app = new PIXI.Application();
        this.grid = new PIXI.Graphics();
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

        this.app.stage.interactive = true;
        this.app.stage.on('pointerdown', this.onDragStart);
        this.app.stage.on('pointerup', this.onDragEnd);
        this.app.stage.on('pointerupoutside', this.onDragEnd);
        this.app.stage.on('pointermove', this.onDragMove);
        this.app.canvas.addEventListener('wheel', this.onZoom, { passive: false });

        this.grid.zIndex = -1; // Draw behind everything else
        this.app.stage.addChild(this.grid);

        this.isInitialized = true;
        console.log('[Renderer] Pixi.js application initialized and attached to DOM.');
    }

    public resize(width: number, height: number): void {
        if (!this.isInitialized) return;
        this.app.renderer.resize(width, height);
        if (this.isGridVisible) {
            this.drawGrid();
        }
        console.log(`[Renderer] Resized to ${width}x${height}`);
    }

    public toggleGrid(): void {
        this.isGridVisible = !this.isGridVisible;
        this.grid.visible = this.isGridVisible;
        if(this.isGridVisible){
            this.drawGrid();
        }
    }

    private onDragStart = (event: PIXI.FederatedPointerEvent) => {
        if (event.button === 1) { // Middle mouse button
            this.isPanning = true;
            this.lastPanPosition = { x: event.global.x, y: event.global.y };
            this.app.canvas.style.cursor = 'grabbing';
        }
    };

    private onDragEnd = () => {
        this.isPanning = false;
        this.app.canvas.style.cursor = 'default';
    };

    private onDragMove = (event: PIXI.FederatedPointerEvent) => {
        if (this.isPanning) {
            const dx = event.global.x - this.lastPanPosition.x;
            const dy = event.global.y - this.lastPanPosition.y;

            this.app.stage.pivot.x -= dx / this.app.stage.scale.x;
            this.app.stage.pivot.y -= dy / this.app.stage.scale.y;

            this.lastPanPosition = { x: event.global.x, y: event.global.y };
            if(this.isGridVisible) this.drawGrid();
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

        if(this.isGridVisible) this.drawGrid();
    };

    private drawGrid = () => {
        if (!this.isGridVisible || !this.isInitialized) return;

        this.grid.clear();
        this.grid.stroke({ width: 1, color: 0x333333 });
        
        const scale = this.app.stage.scale.x;
        let gridSize = 100;
        if (scale < 0.25) gridSize = 400;
        else if (scale < 0.75) gridSize = 200;
        else if (scale > 2) gridSize = 50;
        
        const view = this.getViewBounds();

        const startX = Math.floor(view.x / gridSize) * gridSize;
        const endX = view.x + view.width;
        const startY = Math.floor(view.y / gridSize) * gridSize;
        const endY = view.y + view.height;

        for (let x = startX; x < endX; x += gridSize) {
            this.grid.moveTo(x, startY);
            this.grid.lineTo(x, endY);
        }
        for (let y = startY; y < endY; y += gridSize) {
            this.grid.moveTo(startX, y);
            this.grid.lineTo(endX, y);
        }
    }

    public getViewBounds(): PIXI.Rectangle {
        if (!this.isInitialized) {
            return new PIXI.Rectangle(0, 0, 0, 0);
        }
        return new PIXI.Rectangle(
            this.app.stage.pivot.x,
            this.app.stage.pivot.y,
            this.app.screen.width / this.app.stage.scale.x,
            this.app.screen.height / this.app.stage.scale.y
        );
    }
}