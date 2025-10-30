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
import { Renderer, GridConfig, FrameConfig } from './src/core/rendering/Renderer';
import { LogicSystem } from './src/core/library/LogicSystem';
import { Graph } from './src/core/graph/Graph';
import { GraphInterpreter } from './src/core/graph/GraphInterpreter';
import { ProjectManager } from './src/core/project/ProjectManager';
import { CommandManager } from './src/core/commands/CommandManager';
import { DestroyEntityCommand } from './src/core/commands/DestroyEntityCommand';
import LogicGraphPanel from './src/core/ui/LogicGraphPanel';
import { DebugProvider } from './src/core/ui/dev/DebugContext';
import SettingsPanel, { devicePresets } from './src/core/ui/SettingsPanel';
import { EventBus } from './src/core/ecs/EventBus';
import ProgressBarHeader from './src/core/ui/ProgressBarHeader';
import { AuthProvider, useAuth } from './src/core/auth/AuthContext';
import LoginPage from './src/core/ui/LoginPage';
import AdminDashboard from './src/core/ui/admin/AdminDashboard';
import UIEditorPanel, { SectionData, WidgetData, ColumnData } from './src/core/ui/UIEditorPanel';

type MainView = 'scene' | 'ui-editor' | 'logic-graph' | 'layers';

const MainViewTabs: React.FC<{ activeTab: MainView, onTabChange: (tabId: MainView) => void }> = ({ activeTab, onTabChange }) => {
    const tabs: { id: MainView; label: string }[] = [
        { id: 'scene', label: 'Scene' },
        { id: 'ui-editor', label: 'UI Editor' },
        { id: 'logic-graph', label: 'Logic Graph' },
        { id: 'layers', label: 'Layers' },
    ];
    
    return (
        <div style={styles.mainViewTabsContainer}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    style={activeTab === tab.id ? { ...styles.mainViewTab, ...styles.activeMainViewTab } : styles.mainViewTab}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};


const getLayoutKeyFromConfig = (config: FrameConfig): string => {
    if (!config.isVisible) {
        return 'default';
    }
    const preset = devicePresets.find(p => p.width === config.width && p.height === config.height)
        || devicePresets.find(p => p.height === config.width && p.width === config.height);

    return preset?.name.toLowerCase() || 'default';
};

const App = () => {
    const { user, token, logout } = useAuth();
    const [ecsWorld, setEcsWorld] = useState<World | null>(null);
    const [activeMainView, setActiveMainView] = useState<MainView>('ui-editor');
    const [isAdminView, setIsAdminView] = useState(false);
    const renderingSystemRef = useRef<RenderingSystem | null>(null);
    const graphRef = useRef<Graph | null>(null);
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const hasRunInitialTests = useRef(false);
    const [gridConfig, setGridConfig] = useState<GridConfig>({
        isVisible: true,
        size: 100,
        color1: 0x444444,
        color2: 0x333333,
    });
    const [frameConfig, setFrameConfig] = useState<FrameConfig>({
        isVisible: false,
        width: 1920,
        height: 1080,
        color: 0x00aaff,
        orientation: 'landscape',
        autoHeight: false,
    });
    const [activeLayoutKey, setActiveLayoutKey] = useState('default');
    
    // UI Builder State
    const [uiLayout, setUiLayout] = useState<SectionData[]>([]);
    const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
    const [isInspectorHelpVisible, setIsInspectorHelpVisible] = useState(false);

    const toggleInspectorHelp = useCallback(() => {
        setIsInspectorHelpVisible(prev => !prev);
    }, []);

    const handleWidgetSelect = useCallback((widgetId: string | null) => {
        setSelectedWidgetId(widgetId);
        if (widgetId !== null) {
            setSelectedSectionId(null);
            setSelectedColumnId(null);
        }
    }, []);

    const handleSectionSelect = useCallback((sectionId: string | null) => {
        setSelectedSectionId(sectionId);
        if (sectionId !== null) {
            setSelectedWidgetId(null);
            setSelectedColumnId(null);
        }
    }, []);

    const handleColumnSelect = useCallback((columnId: string | null) => {
        setSelectedColumnId(columnId);
        if (columnId !== null) {
            setSelectedWidgetId(null);
            setSelectedSectionId(null);
        }
    }, []);

    const handleSectionPropertyChange = useCallback((sectionId: string, propName: string, propValue: any) => {
        setUiLayout(prevLayout =>
            prevLayout.map(section =>
                section.id === sectionId
                    ? { ...section, [propName]: propValue }
                    : section
            )
        );
    }, []);

    const handleColumnPropertyChange = useCallback((columnId: string, propName: string, propValue: any) => {
        setUiLayout(prevLayout =>
            prevLayout.map(section => ({
                ...section,
                columns: section.columns.map(column => {
                    if (column.id === columnId) {
                        return { 
                            ...column, 
                            styles: { ...column.styles, [propName]: propValue } 
                        };
                    }
                    return column;
                })
            }))
        );
    }, []);


    useEffect(() => {
        // Do not run setup if not logged in
        if (!token) return;

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
                    renderer.setFrameConfig(frameConfig);
                }
                
                // Run automatic self-test on load
                if (!hasRunInitialTests.current) {
                    hasRunInitialTests.current = true;
                    // We don't need the return value here, just trigger the run and local storage save
                    handleRunTests(); 
                }

            } catch (e: any) {
                console.error('An unexpected error occurred during initial setup:', e);
            }
        };
        
        setupEcs();

        const handleProjectLoaded = (payload: { activeLayoutKey: string }) => {
            const loadedKey = payload.activeLayoutKey;
            setActiveLayoutKey(loadedKey);
            
            if (loadedKey === 'default') {
                setFrameConfig(prev => ({ ...prev, isVisible: false }));
            } else {
                const preset = devicePresets.find(p => p.name.toLowerCase() === loadedKey);
                if (preset) {
                    setFrameConfig(prev => ({
                        ...prev,
                        isVisible: true,
                        width: preset.width,
                        height: preset.height,
                        orientation: preset.width > preset.height ? 'landscape' : 'portrait'
                    }));
                }
            }
        };
        
        const handleWidgetPropertyUpdate = (payload: { widgetId: string, propName: string, propValue: any }) => {
            setUiLayout(prevLayout => {
                return prevLayout.map(section => ({
                    ...section,
                    columns: section.columns.map(column => ({
                        ...column,
                        widgets: column.widgets.map(widget => {
                            if (widget.id === payload.widgetId) {
                                // BUGFIX: Differentiate between updating 'props' and 'styles'
                                if (payload.propName === 'styles') {
                                    return { ...widget, styles: payload.propValue };
                                }
        
                                return { ...widget, props: { ...widget.props, [payload.propName]: payload.propValue } };
                            }
                            return widget;
                        })
                    }))
                }));
            });
        };
        
        const handleWidgetDelete = (payload: { widgetId: string }) => {
            setUiLayout(prevLayout => {
                const newLayout = prevLayout.map(section => ({
                    ...section,
                    columns: section.columns.map(column => ({
                        ...column,
                        widgets: column.widgets.filter(widget => widget.id !== payload.widgetId)
                    }))
                }));
                return newLayout;
            });
            // Deselect the widget after deleting it
            setSelectedWidgetId(null);
        };
        
        const handleWidgetMove = (payload: { source: { widgetId: string; sourceSectionId: string; sourceColumnIndex: number; }; target: { targetSectionId: string; targetColumnIndex: number; targetDropIndex: number; }; }) => {
            const { source, target } = payload;
            
            setUiLayout(prevLayout => {
                const newLayout = JSON.parse(JSON.stringify(prevLayout)); // Deep copy
                
                // 1. Find and remove the widget from the source
                const sourceSection = newLayout.find((s: SectionData) => s.id === source.sourceSectionId);
                if (!sourceSection) {
                    console.error("Drag-and-drop failed: Source section not found.");
                    return prevLayout;
                }

                const sourceColumn = sourceSection.columns[source.sourceColumnIndex];
                if (!sourceColumn) {
                    console.error("Drag-and-drop failed: Source column not found.");
                    return prevLayout;
                }

                const widgetIndex = sourceColumn.widgets.findIndex((w: WidgetData) => w.id === source.widgetId);
                if (widgetIndex === -1) {
                    console.error("Drag-and-drop failed: Could not find widget in source.");
                    return prevLayout;
                }

                const [removedWidget] = sourceColumn.widgets.splice(widgetIndex, 1);

                // 2. Find the target and insert the widget
                const targetSection = newLayout.find((s: SectionData) => s.id === target.targetSectionId);
                 if (!targetSection) {
                    console.error("Drag-and-drop failed: Target section not found.");
                    return prevLayout;
                }
                
                const targetColumn = targetSection.columns[target.targetColumnIndex];
                if (!targetColumn) {
                    console.error("Drag-and-drop failed: Target column not found.");
                    return prevLayout;
                }

                let actualDropIndex = target.targetDropIndex;
                
                // If moving within the same column, adjust the index
                if (source.sourceSectionId === target.targetSectionId && source.sourceColumnIndex === target.targetColumnIndex) {
                    if (widgetIndex < target.targetDropIndex) {
                        actualDropIndex -= 1;
                    }
                }
                
                targetColumn.widgets.splice(actualDropIndex, 0, removedWidget);

                return newLayout;
            });
        };

        EventBus.getInstance().subscribe('project:loaded', handleProjectLoaded);
        EventBus.getInstance().subscribe('ui-widget:update-prop', handleWidgetPropertyUpdate);
        EventBus.getInstance().subscribe('ui-widget:delete', handleWidgetDelete);
        EventBus.getInstance().subscribe('ui-widget:move', handleWidgetMove);

        return () => {
            if (gameLoop && gameLoop.isRunning) {
                gameLoop.stop();
            }
            if(autoSaveInterval) {
                clearInterval(autoSaveInterval);
            }
            EventBus.getInstance().unsubscribe('project:loaded', handleProjectLoaded);
            EventBus.getInstance().unsubscribe('ui-widget:update-prop', handleWidgetPropertyUpdate);
            EventBus.getInstance().unsubscribe('ui-widget:delete', handleWidgetDelete);
            EventBus.getInstance().unsubscribe('ui-widget:move', handleWidgetMove);
        };

    }, [token]); // Rerun setup when token changes (on login)
    
    const handleRunTests = useCallback(async (slugToRun?: string): Promise<string> => {
        const logger = new TestLogger();
        try {
            const testsToRun: Record<string, Function> = {};

            if (slugToRun) {
                if (testRegistry[slugToRun]) {
                    testsToRun[slugToRun] = testRegistry[slugToRun];
                } else {
                    logger.logCustom(`Test with slug '${slugToRun}' not found in registry.`, 'ERROR');
                }
            } else {
                Object.assign(testsToRun, testRegistry);
            }

            for (const slug in testsToRun) {
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

                await testsToRun[slug](logger, { world: testWorld });
            }

            const logContent = logger.getLog();
            const cleanLog = logContent.replace(/\x1b\[[0-9;]*m/g, '');

            try {
                // Only save full-run logs to local storage to avoid overwriting with single test runs
                if (!slugToRun) {
                    const logLines = cleanLog.split('\n').filter(line => line.trim() !== '');
                    const logData = {
                        timestamp: new Date().toISOString(),
                        results: logLines,
                    };
                    localStorage.setItem('test-execution-log', JSON.stringify(logData));
                    console.log('[App] Test execution log saved to localStorage.');
                }
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
             if (!slugToRun) {
                localStorage.setItem('test-execution-log', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    results: ['[CRITICAL] An unexpected error occurred during test execution.', ...errorLines]
                }));
            }
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

    const handlePreviewProject = useCallback(() => {
        ProjectManager.getInstance().previewProject();
    }, []);

    const handleUndo = useCallback(() => {
        CommandManager.getInstance().undo();
    }, []);

    const handleRedo = useCallback(() => {
        CommandManager.getInstance().redo();
    }, []);
    
    const showAdminView = useCallback(() => {
        if (user?.roles.includes('ADMIN')) {
            setIsAdminView(true);
        } else {
            console.warn("Access denied: Admin view is restricted.");
        }
    }, [user]);

    const handleCloseAdminView = useCallback(() => {
        setIsAdminView(false);
    }, []);

    const handleMainViewChange = useCallback((viewId: MainView) => {
        setIsAdminView(false);
        setActiveMainView(viewId);
    }, []);

    useEffect(() => {
        if (!token) return;

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
    }, [ecsWorld, handleSaveProject, handleUndo, handleRedo, token]);

    const handleGridConfigChange = useCallback((newConfig: Partial<GridConfig>) => {
        setGridConfig(prevConfig => {
            const updatedConfig = { ...prevConfig, ...newConfig };
            Renderer.getInstance().setGridConfig(updatedConfig);
            return updatedConfig;
        });
    }, []);

    const handleFrameConfigChange = useCallback((newConfig: Partial<FrameConfig>) => {
        setFrameConfig(prevConfig => {
            const updatedConfig = { ...prevConfig, ...newConfig };
            const newLayoutKey = getLayoutKeyFromConfig(updatedConfig);
            
            if (newLayoutKey !== activeLayoutKey) {
                ProjectManager.getInstance().switchActiveLayout(newLayoutKey);
                setActiveLayoutKey(newLayoutKey);
            }

            Renderer.getInstance().setFrameConfig(updatedConfig);
            return updatedConfig;
        });
    }, [activeLayoutKey]);

    const handleToggleColliders = useCallback(() => {
        renderingSystemRef.current?.toggleDebugRendering();
    }, []);

    // If not authenticated, show the login page
    if (!token) {
        return <LoginPage />;
    }

    // If authenticated, show the main app
    return (
        <div style={styles.container}>
            <ProgressBarHeader />
            <main style={styles.main}>
                <Toolbar 
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onSave={handleSaveProject}
                    onLoad={handleLoadProject}
                    onPreview={handlePreviewProject}
                    onExportHTML={handleExportHTML}
                    onLogout={logout}
                    onAdminClick={showAdminView}
                />
                <ResizablePanels>
                    <LeftSidebar />
                    
                    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', minWidth: 0, backgroundColor: '#2d2d2d' }}>
                        {!isAdminView && <MainViewTabs activeTab={activeMainView} onTabChange={handleMainViewChange} />}
                        
                        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                            {isAdminView && (
                                <AdminDashboard 
                                    onRunTests={handleRunTests} 
                                    onToggleColliders={handleToggleColliders}
                                    onClose={handleCloseAdminView}
                                />
                            )}
                            {!isAdminView && (
                                <>
                                    <div style={{ display: activeMainView === 'scene' ? 'block' : 'none', height: '100%' }}>
                                        <CanvasContainer 
                                            world={ecsWorld} 
                                            renderingSystem={renderingSystemRef.current}
                                            frameConfig={frameConfig}
                                            onFrameConfigChange={handleFrameConfigChange}
                                            onOpenSettingsPanel={() => setIsSettingsPanelOpen(true)}
                                        />
                                    </div>
                                    <div style={{ display: activeMainView === 'logic-graph' ? 'block' : 'none', height: '100%' }}>
                                        <LogicGraphPanel />
                                    </div>
                                     <div style={{ display: activeMainView === 'ui-editor' ? 'flex' : 'none', height: '100%' }}>
                                        <UIEditorPanel 
                                            layout={uiLayout}
                                            onLayoutChange={setUiLayout}
                                            selectedWidgetId={selectedWidgetId}
                                            onWidgetSelect={handleWidgetSelect}
                                            selectedSectionId={selectedSectionId}
                                            onSectionSelect={handleSectionSelect}
                                            selectedColumnId={selectedColumnId}
                                            onColumnSelect={handleColumnSelect}
                                        />
                                    </div>
                                    <div style={{ display: activeMainView === 'layers' ? 'block' : 'none', height: '100%', padding: '1rem' }}>
                                        <p>Layers View Placeholder</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <RightSidebar 
                        world={ecsWorld}
                        frameConfig={frameConfig}
                        onFrameConfigChange={handleFrameConfigChange}
                        uiLayout={uiLayout}
                        selectedWidgetId={selectedWidgetId}
                        selectedSectionId={selectedSectionId}
                        onSectionPropertyChange={handleSectionPropertyChange}
                        selectedColumnId={selectedColumnId}
                        onColumnPropertyChange={handleColumnPropertyChange}
                        onColumnSelect={handleColumnSelect}
                        isInspectorHelpVisible={isInspectorHelpVisible}
                        onToggleInspectorHelp={toggleInspectorHelp}
                    />
                </ResizablePanels>
            </main>
            {isSettingsPanelOpen && (
                <SettingsPanel
                    isOpen={isSettingsPanelOpen}
                    onClose={() => setIsSettingsPanelOpen(false)}
                    gridConfig={gridConfig}
                    onGridConfigChange={handleGridConfigChange}
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
    mainViewTabsContainer: {
        display: 'flex',
        flexShrink: 0,
        backgroundColor: '#1e1e1e',
        borderBottom: '1px solid #444',
    },
    mainViewTab: {
        padding: '0.6rem 1.2rem',
        cursor: 'pointer',
        backgroundColor: '#2d2d2d',
        border: 'none',
        borderRight: '1px solid #1e1e1e',
        color: '#ccc',
        fontSize: '0.9rem',
    },
    activeMainViewTab: {
        backgroundColor: '#333',
        color: '#fff',
    },
};

// Root component to manage the auth provider
const Root = () => {
    const { isLoading } = useAuth();

    if (isLoading) {
        // You can add a global loading spinner here if you want
        return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e1e1e', color: '#d4d4d4'}}>Loading...</div>;
    }

    return <App />;
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
    <React.StrictMode>
        <DebugProvider>
            <AuthProvider>
                <Root />
            </AuthProvider>
        </DebugProvider>
    </React.StrictMode>
);