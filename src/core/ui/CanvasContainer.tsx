import React, { ReactNode, useEffect, useRef } from 'react';
import { World } from '../ecs/World';
import { PositionComponent } from '../library/PositionComponent';
import { Renderer } from '../rendering/Renderer';
import { TemplateManager } from '../library/TemplateManager';
import * as PIXI from 'pixi.js';
import { RenderingSystem } from '../library/RenderingSystem';
import { CreateEntityCommand } from '../commands/CreateEntityCommand';
import { CommandManager } from '../commands/CommandManager';


interface CanvasContainerProps {
    children: ReactNode;
    world: World | null;
    renderingSystem: RenderingSystem | null;
}

const CanvasContainer: React.FC<CanvasContainerProps> = ({ children, world, renderingSystem }) => {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const animationFrameId = useRef<number>(0);

    // Initialize Renderer
    useEffect(() => {
        const container = canvasContainerRef.current;
        if (container && container.children.length === 0) {
            const renderer = Renderer.getInstance();
            const initRenderer = async () => {
                await renderer.init(container, container.clientWidth, container.clientHeight);
            };
            initRenderer();
        }
    }, []);

    // Handle Resize
    useEffect(() => {
        const container = canvasContainerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(entries => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            animationFrameId.current = requestAnimationFrame(() => {
                for (let entry of entries) {
                    const { width, height } = entry.contentRect;
                    Renderer.getInstance().resize(width, height);
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
    }, [renderingSystem]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Allow drop
        e.dataTransfer.dropEffect = 'copy';
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!world) return;
    
        // Prevent drop on UI elements by checking the target
        if ((e.target as HTMLElement).closest('.ui-content-wrapper')) {
            return;
        }
    
        const templateName = e.dataTransfer.getData('text/plain').replace('Component', '').toLowerCase();
        
        const renderer = Renderer.getInstance();
        const localPoint = renderer.app.stage.toLocal(new PIXI.Point(e.clientX, e.clientY));
    
        const command = new CreateEntityCommand(world, templateName, { x: localPoint.x, y: localPoint.y });
        CommandManager.getInstance().executeCommand(command);

        // After creation, the new entity ID is available on the command if needed
        const newEntityId = command.entityId;
        if (newEntityId !== null) {
            console.log(`[Canvas] Dispatched CreateEntityCommand for template "${templateName}" at (${localPoint.x.toFixed(0)}, ${localPoint.y.toFixed(0)})`);
            world.selectEntity(newEntityId);
        } else {
            console.warn(`[Canvas] Could not create entity from template name: "${templateName}". It may not be a valid template.`);
        }
    };
    

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!world || e.button !== 0) return; // Ignore non-left clicks
        
        if ((e.target as HTMLElement).closest('.ui-content-wrapper')) {
            return;
        }

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
            style={styles.mainContent}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
            onContextMenu={(e) => e.preventDefault()} // Prevent context menu on right-click
        >
            <div id="canvas-container" ref={canvasContainerRef} style={styles.canvasWrapper}>
                {/* Pixi.js canvas will be appended here by Renderer.init() */}
            </div>
            <div className="ui-content-wrapper" style={styles.contentWrapper}>
                {children}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    mainContent: {
        padding: '2rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        position: 'relative', // For positioning canvas overlay
    },
    canvasWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
    },
    contentWrapper: {
        position: 'relative',
        zIndex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
};

export default CanvasContainer;