import { SystemBase } from './SystemBase';
import { EntityManager } from '../ecs/EntityManager';
import { ComponentManager } from '../ecs/ComponentManager';
import { PositionComponent } from './PositionComponent';
import { SpriteComponent } from './SpriteComponent';
import { Renderer } from '../rendering/Renderer';
import { EventBus } from '../ecs/EventBus';
import { Entity } from '../ecs/types';
import * as PIXI from 'pixi.js';
import { ColliderComponent } from './ColliderComponent';

/**
 * @class RenderingSystem
 * @description Handles rendering entities with Position and Sprite components using Pixi.js.
 * @extends SystemBase
 */
export class RenderingSystem extends SystemBase {
    private renderer: Renderer;
    private sprites: Map<Entity, PIXI.Sprite> = new Map();
    private selectionHighlight: PIXI.Graphics;
    private selectedEntityId: Entity | null = null;

    private isDebugVisible: boolean = false;
    private debugColliders: Map<Entity, PIXI.Graphics> = new Map();
    
    private viewWidth: number = 0;
    private viewHeight: number = 0;


    /**
     * Initializes a new instance of the RenderingSystem.
     */
    constructor() {
        super([PositionComponent, SpriteComponent]);
        this.renderer = Renderer.getInstance();
        
        // Defer accessing renderer.app until it's initialized
        if(this.renderer.isInitialized) {
            this.renderer.app.stage.sortableChildren = true;
        }

        this.selectionHighlight = new PIXI.Graphics();
        this.selectionHighlight.visible = false;
        
        if(this.renderer.isInitialized) {
            this.renderer.app.stage.addChild(this.selectionHighlight);
        }

        EventBus.getInstance().subscribe('entity:destroyed', this.handleEntityDestroyed);
        EventBus.getInstance().subscribe('entity:selected', this.handleEntitySelected);
        EventBus.getInstance().subscribe('entity:deselected', this.handleEntityDeselected);
    }
    
    /**
     * Public method to be called when the canvas resizes.
     * @param {number} width - The new width of the view.
     * @param {number} height - The new height of the view.
     */
    public onResize(width: number, height: number): void {
        this.viewWidth = width;
        this.viewHeight = height;
    }

    private handleEntityDestroyed = (payload: { entityId: Entity }): void => {
        if (!this.renderer.isInitialized) return;
        const sprite = this.sprites.get(payload.entityId);
        if (sprite) {
            this.renderer.app.stage.removeChild(sprite);
            sprite.destroy();
            this.sprites.delete(payload.entityId);
        }
        const debugGraphic = this.debugColliders.get(payload.entityId);
        if (debugGraphic) {
            this.renderer.app.stage.removeChild(debugGraphic);
            debugGraphic.destroy();
            this.debugColliders.delete(payload.entityId);
        }
    };
    
    private handleEntitySelected = (payload: { entityId: Entity }): void => {
        if (!this.renderer.isInitialized) return;
        this.selectedEntityId = payload.entityId;
        this.selectionHighlight.visible = true;
    };
    
    private handleEntityDeselected = (): void => {
        if (!this.renderer.isInitialized) return;
        this.selectedEntityId = null;
        this.selectionHighlight.visible = false;
    };

    public toggleDebugRendering(): void {
        this.isDebugVisible = !this.isDebugVisible;
        this.debugColliders.forEach(g => g.visible = this.isDebugVisible);
        if (!this.isDebugVisible) {
             this.debugColliders.forEach(g => {
                if (this.renderer.isInitialized) {
                    this.renderer.app.stage.removeChild(g);
                }
                g.destroy();
            });
            this.debugColliders.clear();
        }
    }


    /**
     * The update method, called every frame. It creates, updates, or removes sprites based on ECS data.
     */
    public update(deltaTime: number, entityManager: EntityManager, componentManager: ComponentManager): void {
        if (!this.renderer.isInitialized) {
            // Add a check after initialization to add necessary children to the stage
            if (Renderer.getInstance().isInitialized) {
                this.renderer = Renderer.getInstance(); // re-get instance
                this.renderer.app.stage.sortableChildren = true;
                this.renderer.app.stage.addChild(this.selectionHighlight);
            } else {
                 return; // Guard clause to prevent rendering before initialization
            }
        }
        
        const entities = componentManager.getEntitiesWithComponents(this.requiredComponents);
        const allActiveEntities = entityManager.getActiveEntities();

        const view = this.renderer.getViewBounds();

        for (const entity of entities) {
            const pos = componentManager.getComponent(entity, PositionComponent);
            const spriteComp = componentManager.getComponent(entity, SpriteComponent);

            if (!pos || !spriteComp) continue;

            let sprite = this.sprites.get(entity);

            if (!sprite) {
                if (!spriteComp.texture) continue;
                if (PIXI.Assets.cache.has(spriteComp.texture)) {
                    const texture = PIXI.Assets.get(spriteComp.texture);
                    sprite = new PIXI.Sprite(texture);
                    this.sprites.set(entity, sprite);
                    this.renderer.app.stage.addChild(sprite);
                } else {
                    PIXI.Assets.load(spriteComp.texture).catch(err => {
                        console.error(`[RenderingSystem] Failed to load texture "${spriteComp.texture}" for entity ${entity}:`, err);
                        componentManager.toggleComponent(entity, SpriteComponent, false);
                    });
                    continue;
                }
            }
            
            sprite.x = pos.x;
            sprite.y = pos.y;
            sprite.zIndex = pos.z;
            if (spriteComp.width > 0) sprite.width = spriteComp.width;
            if (spriteComp.height > 0) sprite.height = spriteComp.height;

            // Culling
            const bounds = sprite.getBounds();
            sprite.visible = bounds.right > view.x && bounds.left < view.x + view.width &&
                             bounds.bottom > view.y && bounds.top < view.y + view.height;

            // Debug Rendering
            if(this.isDebugVisible && sprite.visible){
                const collider = componentManager.getComponent(entity, ColliderComponent);
                if(collider){
                    let debugGraphic = this.debugColliders.get(entity);
                    if(!debugGraphic){
                        debugGraphic = new PIXI.Graphics();
                        this.debugColliders.set(entity, debugGraphic);
                        this.renderer.app.stage.addChild(debugGraphic);
                    }
                    debugGraphic.clear();
                    debugGraphic.stroke({ width: 1, color: 0xff00ff }); // Magenta
                    debugGraphic.drawRect(0, 0, collider.size.width, collider.size.height);
                    debugGraphic.x = pos.x;
                    debugGraphic.y = pos.y;
                    debugGraphic.zIndex = pos.z + 1; // Draw on top of sprite
                }
            } else if (this.debugColliders.has(entity)) {
                this.debugColliders.get(entity)!.visible = false;
            }
        }

        // Update selection highlight
        if (this.selectedEntityId !== null) {
            const selectedSprite = this.sprites.get(this.selectedEntityId);
            if (selectedSprite && selectedSprite.visible) {
                const bounds = selectedSprite.getBounds();
                this.selectionHighlight.clear();
                this.selectionHighlight.stroke({ width: 2, color: 0x00ff00 }); // Green
                this.selectionHighlight.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
                this.selectionHighlight.zIndex = 9999;
                this.selectionHighlight.visible = true;
            } else {
                this.selectionHighlight.visible = false;
            }
        }
        
        // Cleanup destroyed debug graphics
        if(this.isDebugVisible) {
            for (const entity of this.debugColliders.keys()) {
                if(!allActiveEntities.has(entity)){
                     const debugGraphic = this.debugColliders.get(entity);
                     if(debugGraphic){
                         this.renderer.app.stage.removeChild(debugGraphic);
                         debugGraphic.destroy();
                         this.debugColliders.delete(entity);
                     }
                }
            }
        }
    }
}