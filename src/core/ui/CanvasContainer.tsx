import React, { useEffect, useRef } from 'react';
import { World } from '../ecs/World';
import { Renderer } from '../rendering/Renderer';
import * as PIXI from 'pixi.js';
import { RenderingSystem } from '../library/RenderingSystem';
import { CreateEntityCommand } from '../commands/CreateEntityCommand';
import { CommandManager } from '../commands/CommandManager';


interface CanvasContainerProps {
    world: World | null;
    renderingSystem: RenderingSystem | null;
}

const CanvasContainer: React.FC<CanvasContainerProps> = ({ world, renderingSystem }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameId = useRef<number>(0);

    // Initialize Renderer & Handle Resize
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let renderer: Renderer;
        const initAndObserve = async () => {
            renderer = Renderer.getInstance();
            if (!renderer.isInitialized) {
                await renderer.init(container, container.clientWidth, container.clientHeight);
                
                // --- START: ADD DUMMY OBJECT ---
                // This is a temporary visual aid to confirm the canvas is rendering.
                const dummyObject = new PIXI.Graphics();
                dummyObject.fill(0xFF0000); // Red color
                dummyObject.circle(0, 0, 50); // 50px radius circle
                dummyObject.fill();
                // Position at world origin (0,0), which is now the center of the screen
                dummyObject.x = 0;
                dummyObject.y = 0;
                renderer.app.stage.addChild(dummyObject);
                // --- END: ADD DUMMY OBJECT ---
            }

            const resizeObserver = new ResizeObserver(entries => {
                if (animationFrameId.current) {
                    cancelAnimationFrame(animationFrameId.current);
                }
                animationFrameId.current = requestAnimationFrame(() => {
                    for (let entry of entries) {
                        const { width, height } = entry.contentRect;
                        renderer.resize(width, height);
                        if (renderingSystem) {
                            renderingSystem.onResize(width, height);
                        }
                    }
                });
            });

            resizeObserver.observe(container);

            return () => {
                resizeObserver.disconnect();
                if (animationFrameId.current) {
                    cancelAnimationFrame(animationFrameId.current);
                }
            };
        };

        const cleanupPromise = initAndObserve();

        return () => {
            cleanupPromise.then(cleanup => cleanup && cleanup());
        };
    }, [renderingSystem]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Allow drop
        e.dataTransfer.dropEffect = 'copy';
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!world) return;
    
        const templateId = e.dataTransfer.getData('text/plain');
        
        const renderer = Renderer.getInstance();
        if (!renderer.isInitialized || !templateId) return;
        const localPoint = renderer.app.stage.toLocal(new PIXI.Point(e.clientX, e.clientY));
    
        const command = new CreateEntityCommand(world, templateId, { x: localPoint.x, y: localPoint.y });
        CommandManager.getInstance().executeCommand(command);

        const newEntityId = command.entityId;
        if (newEntityId !== null) {
            world.selectEntity(newEntityId);
        } else {
            console.warn(`[Canvas] Could not create entity from template ID: "${templateId}". It may not be a valid template.`);
        }
    };
    

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!world || e.button !== 0) return; // Ignore non-left clicks
        
        // Placeholder for raycasting. For now, selects the most recent entity.
        const activeEntities = Array.from(world.entityManager.getActiveEntities());
        if (activeEntities.length > 0) {
            const lastEntity = activeEntities[activeEntities.length - 1];
            if (world.selectedEntity === lastEntity) {
                world.selectEntity(null); // Deselect if clicking the same one
            } else {
                world.selectEntity(lastEntity);
            }
        } else {
            world.selectEntity(null); // Deselect if clicking on empty space
        }
    };
    
    return (
        <div 
            ref={containerRef}
            style={styles.canvasWrapper}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Pixi.js canvas will be appended here by Renderer.init() */}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    canvasWrapper: {
        width: '100%',
        flex: 1,
        overflow: 'hidden',
        position: 'relative' // Needed for PIXI canvas positioning
    },
};

export default CanvasContainer;