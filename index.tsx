import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { EntityManager } from './src/core/ecs/EntityManager';
import { ComponentManager } from './src/core/ecs/ComponentManager';
import { SystemManager } from './src/core/ecs/SystemManager';
import { GameLoop } from './src/core/ecs/GameLoop';
import { TestLogger } from './src/core/dev/TestLogger';
import { World } from './src/core/ecs/World';
import ResizablePanels from './src/core/ui/ResizablePanels';
import { testRegistry } from './src/core/dev/tests';
import { PositionComponent } from './src/core/library/PositionComponent';
import { VelocityComponent } from './src/core/library/VelocityComponent';
import { SpriteComponent } from './src/core/library/SpriteComponent';
import { HealthComponent } from './src/core/library/HealthComponent';
import { PlayerInputComponent } from './src/core/library/PlayerInputComponent';
import { PhysicsBodyComponent } from './src/core/library/PhysicsBodyComponent';
import { ColliderComponent } from './src/core/library/ColliderComponent';
import { ScoreComponent } from './src/core/library/ScoreComponent';
import { AIPatrolComponent } from './src/core/library/AIPatrolComponent';
import LeftSidebar from './src/core/ui/LeftSidebar';
import RightSidebar from './src/core/ui/RightSidebar';
import CanvasContainer from './src/core/ui/CanvasContainer';
import Toolbar from './src/core/ui/Toolbar';
import { RenderingSystem } from './src/core/library/RenderingSystem';
import { Renderer, GridConfig } from './src/core/rendering/Renderer';
import { LogicSystem } from './src/core/library/LogicSystem';
import { Graph } from './src/core/graph/Graph';
import { GraphInterpreter } from './src/core/graph/GraphInterpreter';
import { ProjectManager } from './src/core/project/ProjectManager';
import { CommandManager } from './src/core/commands/CommandManager';
import { DestroyEntityCommand } from './src/core/commands/DestroyEntityCommand';
import LogicGraphPanel from './src/core/ui/LogicGraphPanel';
import { DebugProvider } from './src/core/ui/dev/DebugContext';
import AdminPanel from './src/core/ui/dev/AdminPanel';
import SettingsPanel from './src/core/ui/SettingsPanel';


const App = () => {
    const [ecsWorld, setEcsWorld] = useState<World | null>(null);
    const [activeView, setActiveView] = useState<'canvas' | 'logic-graph'>('canvas');
    const renderingSystemRef = useRef<RenderingSystem | null>(null);
    const graphRef = useRef<Graph | null>(null);
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const [gridConfig, setGridConfig] = useState<GridConfig>({
        isVisible: true,
        size: 100,
        color1: 0x444444,
        color2: 0x333333,
    });


    useEffect(() => {
        let gameLoop: GameLoop | null = null;
        let autoSaveInterval: number | null = null;

        const setupEcs = async () => {
            try {
                // --- ECS Core Initialization for the main app instance ---
                const entityManager = new EntityManager();
                const componentManager = new ComponentManager();
                const systemManager = new SystemManager(entityManager, componentManager);
                const world = new World(
                    entityManager,
                    componentManager,
                    systemManager
                );

                world.registerComponent(PositionComponent);
                world.registerComponent(VelocityComponent);
                world.registerComponent(SpriteComponent);
                world.registerComponent(HealthComponent);
                world.registerComponent(PlayerInputComponent);
                world.registerComponent(PhysicsBodyComponent);
                world.registerComponent(ColliderComponent);
                world.registerComponent(ScoreComponent);
                world.registerComponent(AIPatrolComponent);
                
                const renderingSystem = new RenderingSystem();
                world.systemManager.registerSystem(renderingSystem, -100); // Render last
                renderingSystemRef.current = renderingSystem;

                // Add Logic Graph System
                const logicGraph = new Graph();
                graphRef.current = logicGraph;
                const graphInterpreter = new GraphInterpreter(logicGraph);
                const logicSystem = new LogicSystem(logicGraph, graphInterpreter);
                world.systemManager.registerSystem(logicSystem, 0);

                // Initialize Project Manager
                const projectManager = ProjectManager.getInstance();
                projectManager.init(world, logicGraph);
                autoSaveInterval = projectManager.startAutoSave(30000); // Auto-save every 30 seconds

                setEcsWorld(world);
                gameLoop = new GameLoop(world.systemManager);
                gameLoop.start();
                
                // Set initial grid config after renderer is initialized
                const renderer = Renderer.getInstance();
                if(renderer.isInitialized) {
                    renderer.setGridConfig(gridConfig);
                }

            } catch (e: any) {
                console.error('An unexpected error occurred during initial setup:', e);
            }
        };
        
        setupEcs();

        return () => {
            if (gameLoop && gameLoop.isRunning) {
                gameLoop.stop();
            }
            if(autoSaveInterval) {
                clearInterval(autoSaveInterval);
            }
        };

    }, []);
    
    const handleRunTests = useCallback(async (): Promise<string> => {
        const logger = new TestLogger();
        try {
            // --- Run All Tests from Registry for localStorage logging ---
            for (const slug in testRegistry) {
                const testEntityManager = new EntityManager();
                const testComponentManager = new ComponentManager();
                const testSystemManager = new SystemManager(testEntityManager, testComponentManager);
                const testWorld = new World(testEntityManager, testComponentManager, testSystemManager);
                
                testWorld.registerComponent(PositionComponent);
                testWorld.registerComponent(VelocityComponent);
                testWorld.registerComponent(SpriteComponent);
                testWorld.registerComponent(HealthComponent);
                testWorld.registerComponent(PlayerInputComponent);
                testWorld.registerComponent(PhysicsBodyComponent);
                testWorld.registerComponent(ColliderComponent);
                testWorld.registerComponent(ScoreComponent);
                testWorld.registerComponent(AIPatrolComponent);

                await testRegistry[slug](logger, { world: testWorld });
            }

            const logContent = logger.getLog();
            const cleanLog = logContent.replace(/\x1b\[[0-9;]*m/g, '');

            try {
                const logLines = cleanLog.split('\n').filter(line => line.trim() !== '');
                const logData = {
                    timestamp: new Date().toISOString(),
                    results: logLines,
                };
                localStorage.setItem('test-execution-log', JSON.stringify(logData));
                console.log('[App] Test execution log saved to localStorage.');
            } catch (e) {
                console.error("Failed to save test log to localStorage", e);
            }
            return cleanLog;
            
        } catch (e: any) {
            console.error('An unexpected error occurred during test execution:', e);
            const errorLogger = new TestLogger();
            errorLogger.logCustom(`[CRITICAL] An unexpected error occurred: ${e.message}`, 'ERROR');
            const errorLogContent = errorLogger.getLog();
            const cleanErrorLog = errorLogContent.replace(/\x1b\[[0-9;]*m/g, '');
            const errorLines = cleanErrorLog.split('\n').filter(line => line.trim() !== '');
            localStorage.setItem('test-execution-log', JSON.stringify({
                timestamp: new Date().toISOString(),
                results: ['[CRITICAL] An unexpected error occurred during test execution.', ...errorLines]
            }));
            return cleanErrorLog;
        }
    }, []);

    const handleSaveProject = useCallback(() => {
        ProjectManager.getInstance().saveProject();
    }, []);

    const handleLoadProject = useCallback(() => {
        ProjectManager.getInstance().loadProject();
    }, []);
    
    const handleExportHTML = useCallback(() => {
        ProjectManager.getInstance().exportToStandaloneHTML();
    }, []);

    const handleUndo = useCallback(() => {
        CommandManager.getInstance().undo();
    }, []);

    const handleRedo = useCallback(() => {
        CommandManager.getInstance().redo();
    }, []);
    
    const handleViewChange = useCallback((viewId: 'canvas' | 'logic-graph') => {
        setActiveView(viewId);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isCtrl = isMac ? e.metaKey : e.ctrlKey;

            if (isCtrl && e.key === 's') {
                e.preventDefault();
                handleSaveProject();
            }
            if (isCtrl && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }
            if (isCtrl && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
                e.preventDefault();
                handleRedo();
            }
    
            const isDelete = e.key === 'Delete' || e.key === 'Backspace';
            if (isDelete && ecsWorld && ecsWorld.selectedEntity !== null) {
                const command = new DestroyEntityCommand(ecsWorld, ecsWorld.selectedEntity);
                CommandManager.getInstance().executeCommand(command);
            }
        };
    
        window.addEventListener('keydown', handleKeyDown);
    
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [ecsWorld, handleSaveProject, handleUndo, handleRedo]);

    const handleGridConfigChange = useCallback((newConfig: Partial<GridConfig>) => {
        setGridConfig(prevConfig => {
            const updatedConfig = { ...prevConfig, ...newConfig };
            Renderer.getInstance().setGridConfig(updatedConfig);
            return updatedConfig;
        });
    }, []);

    const handleToggleColliders = useCallback(() => {
        renderingSystemRef.current?.toggleDebugRendering();
    }, []);

    return (
        <div style={styles.container}>
            <main style={styles.main}>
                <Toolbar 
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onSave={handleSaveProject}
                    onLoad={handleLoadProject}
                    onPreview={() => alert('Live Preview not implemented yet.')}
                    onToggleColliders={handleToggleColliders}
                    onExportHTML={handleExportHTML}
                    onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
                    onOpenSettingsPanel={() => setIsSettingsPanelOpen(true)}
                />
                <ResizablePanels>
                    <LeftSidebar onViewChange={handleViewChange} />
                    {activeView === 'canvas' ? (
                         <CanvasContainer world={ecsWorld} renderingSystem={renderingSystemRef.current} />
                    ) : (
                        <LogicGraphPanel />
                    )}
                    <RightSidebar world={ecsWorld} />
                </ResizablePanels>
            </main>
            {isAdminPanelOpen && (
                <AdminPanel 
                    isOpen={isAdminPanelOpen}
                    onClose={() => setIsAdminPanelOpen(false)}
                    onRunTests={handleRunTests}
                />
            )}
            {isSettingsPanelOpen && (
                <SettingsPanel
                    isOpen={isSettingsPanelOpen}
                    onClose={() => setIsSettingsPanelOpen(false)}
                    config={gridConfig}
                    onConfigChange={handleGridConfigChange}
                />
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
    },
    main: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        flexDirection: 'column',
    },
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
    <DebugProvider>
        <App />
    </DebugProvider>
);