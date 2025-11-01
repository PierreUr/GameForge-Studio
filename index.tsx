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
// FIX: Import missing system classes to resolve 'Cannot find name' errors.
import { PlayerInputSystem } from './src/core/library/PlayerInputSystem';
import { MovementSystem } from './src/core/library/MovementSystem';
import { AIPatrolSystem } from './src/core/library/AIPatrolSystem';
import { PhysicsSystem } from './src/core/library/PhysicsSystem';
import { HealthSystem } from './src/core/library/HealthSystem';
import { ScoringSystem } from './src/core/library/ScoringSystem';
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
import ViewportControls from './src/core/ui/ViewportControls';
import Modal from './src/core/ui/Modal';
import WindowEditorPanel from './src/core/ui/WindowEditorPanel';

type MainView = 'scene' | 'ui-editor' | 'logic-graph' | 'layers' | 'windows';

const MainViewTabs: React.FC<{ activeTab: MainView, onTabChange: (tabId: MainView) => void }> = ({ activeTab, onTabChange }) => {
    const tabs: { id: MainView; label: string }[] = [
        { id: 'scene', label: 'Scene' },
        { id: 'ui-editor', label: 'UI Editor' },
        { id: 'logic-graph', label: 'Logic Graph' },
        { id: 'layers', label: 'Layers' },
        { id: 'windows', label: 'Windows' },
    ];
    
    return (
        // FIX: Replaced non-existent `styles` with `mainViewTabsStyles` which is defined at the end of the file.
        <div style={mainViewTabsStyles.mainViewTabsContainer}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    // FIX: Replaced non-existent `styles` with `mainViewTabsStyles`.
                    style={activeTab === tab.id ? { ...mainViewTabsStyles.mainViewTab, ...mainViewTabsStyles.activeMainViewTab } : mainViewTabsStyles.mainViewTab}
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

const getInitialLayoutState = () => {
    const favoriteKey = localStorage.getItem('gameforge-favorite-layout') || 'desktop';
    const preset = devicePresets.find(p => p.name.toLowerCase() === favoriteKey);
    
    if (preset) {
        return {
            activeLayoutKey: favoriteKey,
            frameConfig: {
                isVisible: true,
                width: preset.width,
                height: preset.height,
                color: 0x00aaff,
                orientation: preset.width > preset.height ? 'landscape' as 'landscape' | 'portrait' : 'portrait' as 'landscape' | 'portrait',
                autoHeight: false,
            }
        };
    }

    // Fallback to desktop if favorite is invalid or not found
    return {
        activeLayoutKey: 'desktop',
        frameConfig: {
            isVisible: true,
            width: 1920,
            height: 1080,
            color: 0x00aaff,
            orientation: 'landscape' as 'landscape' | 'portrait',
            autoHeight: false,
        }
    };
};

const findColumnData = (layout: SectionData[], columnId: string | null): ColumnData | null => {
    if (!columnId) return null;
    for (const section of layout) {
        const column = section.columns.find(c => c.id === columnId);
        if (column) return column;

        // Search in nested sections
        for (const col of section.columns) {
            for (const item of col.widgets) {
                if (!('componentType' in item)) { // It's a SectionData
                    const found = findColumnData([item], columnId);
                    if (found) {
                        return found;
                    }
                }
            }
        }
    }
    return null;
};

// Helper function to recursively remove a widget from the layout
const removeWidgetRecursively = (items: (WidgetData | SectionData)[], widgetId: string): (WidgetData | SectionData)[] => {
    const newItems = [];
    for (const item of items) {
        if (item.id === widgetId) {
            continue; // Skip the item to delete it
        }

        if ('componentType' in item) {
            newItems.push(item); // It's a widget we want to keep
        } else {
            // It's a section, recurse into its columns
            const section = item as SectionData;
            const updatedColumns = section.columns.map(col => ({
                ...col,
                widgets: removeWidgetRecursively(col.widgets, widgetId)
            }));
            newItems.push({ ...section, columns: updatedColumns });
        }
    }
    return newItems;
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
    const [projectName, setProjectName] = useState('my-gameforge-project');
    const [isProjectLive, setIsProjectLive] = useState(false);
    const [gridConfig, setGridConfig] = useState<GridConfig>({
        isVisible: true,
        size: 100,
        color1: 0x444444,
        color2: 0x333333,
    });
    const [initialState] = useState(getInitialLayoutState());
    const [frameConfig, setFrameConfig] = useState<FrameConfig>(initialState.frameConfig);
    const [activeLayoutKey, setActiveLayoutKey] = useState(initialState.activeLayoutKey);
    
    // UI Builder State
    const [uiLayout, setUiLayout] = useState<SectionData[]>([]);
    const [isInspectorHelpVisible, setIsInspectorHelpVisible] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [manualContent, setManualContent] = useState<string | null>(null);
    const [isManualLoading, setIsManualLoading] = useState(false);
    const [widgetManifest, setWidgetManifest] = useState<any>(null);

    useEffect(() => {
        fetch('./src/core/assets/ui-widget-manifest.json')
            .then(res => res.json())
            .then(data => setWidgetManifest(data))
            .catch(err => console.error("Failed to load widget manifest:", err));
    }, []);

    // FIX: Created wrapper functions to handle partial state updates for frame and grid configs.
    // This resolves the TypeScript error where a `Dispatch<SetStateAction>` was passed to a prop
    // expecting a function that accepts a partial object.
    const handleFrameConfigChange = useCallback((newConfig: Partial<FrameConfig>) => {
        setFrameConfig(prev => ({ ...prev, ...newConfig }));
    }, []);

    const handleGridConfigChange = useCallback((newConfig: Partial<GridConfig>) => {
        setGridConfig(prev => ({ ...prev, ...newConfig }));
    }, []);

    const toggleInspectorHelp = useCallback(() => {
        setIsInspectorHelpVisible(prev => !prev);
    }, []);

    const handleToggleHelpModal = useCallback(() => setIsHelpModalOpen(prev => !prev), []);

    useEffect(() => {
        if (isHelpModalOpen && !manualContent) {
            setIsManualLoading(true);
            fetch('./handbuch.html')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(html => {
                    setManualContent(html);
                })
                .catch(error => {
                    console.error('Failed to fetch manual:', error);
                    setManualContent('<p style="color: red;">Error: Could not load the help manual.</p>');
                })
                .finally(() => {
                    setIsManualLoading(false);
                });
        }
    }, [isHelpModalOpen, manualContent]);

    const handleDuplicateSection = useCallback((sectionId: string) => {
        const duplicateRecursively = (item: WidgetData | SectionData): WidgetData | SectionData => {
            const newId = crypto.randomUUID();
            if ('componentType' in item) { // It's a widget
                return { ...item, id: newId };
            }
            // It's a section
            const section = item as SectionData;
            return {
                ...section,
                id: newId,
                columns: section.columns.map(col => ({
                    ...col,
                    id: crypto.randomUUID(),
                    widgets: col.widgets.map(duplicateRecursively)
                }))
            };
        };

        setUiLayout(prevLayout => {
            const newLayout = [...prevLayout];
            const sectionIndex = newLayout.findIndex(s => s.id === sectionId);
            if (sectionIndex !== -1) {
                const originalSection = newLayout[sectionIndex];
                const duplicatedSection = duplicateRecursively(originalSection) as SectionData;
                newLayout.splice(sectionIndex + 1, 0, duplicatedSection);
            }
            return newLayout;
        });
    }, []);


    // --- Project Management ---
    const projectManager = ProjectManager.getInstance();

    const handleSaveProject = useCallback(() => {
        projectManager.saveProject(uiLayout, projectName, isProjectLive);
    }, [projectManager, uiLayout, projectName, isProjectLive]);

    const handleLoadProject = useCallback(() => {
        projectManager.loadProject();
    }, [projectManager]);
    
    const handlePreviewProject = useCallback(() => {
        projectManager.previewProject(uiLayout);
    }, [projectManager, uiLayout]);

    const handleExportHTML = useCallback(() => {
        projectManager.exportToStandaloneHTML(uiLayout);
    }, [projectManager, uiLayout]);
    
    const handleLayoutSwitch = useCallback((newLayoutKey: string) => {
        if (!ecsWorld) return;
        
        const { ecsState, uiState } = projectManager.switchActiveLayout(newLayoutKey, uiLayout);
        ecsWorld.loadProjectState(ecsState);
        setUiLayout(uiState);
        setActiveLayoutKey(newLayoutKey);
    }, [projectManager, uiLayout, ecsWorld]);


    useEffect(() => {
        const handleProjectLoaded = (payload: { activeLayoutKey: string, uiState: SectionData[], isLive: boolean }) => {
            setActiveLayoutKey(payload.activeLayoutKey);
            setUiLayout(payload.uiState);
            setIsProjectLive(payload.isLive);
            
            const preset = devicePresets.find(p => p.name.toLowerCase() === payload.activeLayoutKey) || devicePresets[0];
            setFrameConfig(prev => ({
                ...prev,
                isVisible: true,
                width: preset.width,
                height: preset.height,
                orientation: preset.width > preset.height ? 'landscape' : 'portrait'
            }));
            
            // Deselect everything to prevent stale selections
            EventBus.getInstance().publish('ui-element:deselected');
        };

        EventBus.getInstance().subscribe('project:loaded', handleProjectLoaded);
        return () => EventBus.getInstance().unsubscribe('project:loaded', handleProjectLoaded);
    }, []);


    // --- Command Management ---
    const commandManager = CommandManager.getInstance();
    const handleUndo = () => commandManager.undo();
    const handleRedo = () => commandManager.redo();
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    handleUndo();
                } else if (e.key === 'y') {
                    e.preventDefault();
                    handleRedo();
                } else if (e.key === 's') {
                    e.preventDefault();
                    handleSaveProject();
                }
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                 if(ecsWorld && ecsWorld.selectedEntity !== null) {
                    const command = new DestroyEntityCommand(ecsWorld, ecsWorld.selectedEntity);
                    commandManager.executeCommand(command);
                 }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [ecsWorld, commandManager, handleSaveProject]);


    // --- Inspector Event Handlers ---
    useEffect(() => {
        const eventBus = EventBus.getInstance();

        const handleSectionPropertyChange = (payload: { sectionId: string, propName: string, value: any }) => {
            setUiLayout(prevLayout => {
                const updateRecursively = (items: (WidgetData | SectionData)[]): (WidgetData | SectionData)[] => {
                    return items.map(item => {
                        if ('componentType' in item) return item;
                        const section = item as SectionData;
                        if (section.id === payload.sectionId) {
                            return { ...section, [payload.propName]: payload.value };
                        }
                        const updatedColumns = section.columns.map(col => ({ ...col, widgets: updateRecursively(col.widgets) }));
                        return { ...section, columns: updatedColumns };
                    });
                };
                return updateRecursively(prevLayout) as SectionData[];
            });
        };

        const handleSectionColumnCountChange = (payload: { sectionId: string, count: number }) => {
            setUiLayout(prevLayout => {
                const updateRecursively = (items: (WidgetData | SectionData)[]): (WidgetData | SectionData)[] => {
                    return items.map(item => {
                        if ('componentType' in item) return item;
                        const section = item as SectionData;
                        if (section.id === payload.sectionId) {
                            let newColumns = [...section.columns];
                            if (payload.count > newColumns.length) {
                                for (let i = newColumns.length; i < payload.count; i++) {
                                    newColumns.push({ id: crypto.randomUUID(), widgets: [], styles: {} });
                                }
                            } else if (payload.count < newColumns.length) {
                                const widgetsToMove = newColumns.slice(payload.count).flatMap(col => col.widgets);
                                newColumns = newColumns.slice(0, payload.count);
                                if (newColumns.length > 0) newColumns[newColumns.length - 1].widgets.push(...widgetsToMove);
                            }
                            return { ...section, columnLayout: payload.count, columns: newColumns };
                        }
                        const updatedColumns = section.columns.map(col => ({ ...col, widgets: updateRecursively(col.widgets) }));
                        return { ...section, columns: updatedColumns };
                    });
                };
                return updateRecursively(prevLayout) as SectionData[];
            });
        };

        const handleColumnPropertyChange = (payload: { columnId: string, propName: string, value: any }) => {
            setUiLayout(prevLayout => {
                const updateRecursively = (items: (WidgetData | SectionData)[]): (WidgetData | SectionData)[] => {
                    return items.map(item => {
                        if ('componentType' in item) return item;
                        const section = item as SectionData;
                        const updatedColumns = section.columns.map(col => {
                            if (col.id === payload.columnId) {
                                return { ...col, styles: { ...col.styles, [payload.propName]: payload.value } };
                            }
                            return { ...col, widgets: updateRecursively(col.widgets) };
                        });
                        return { ...section, columns: updatedColumns };
                    });
                };
                return updateRecursively(prevLayout) as SectionData[];
            });
        };
        
        const handleDeleteWidget = (payload: { widgetId: string }) => {
            setUiLayout(prevLayout => removeWidgetRecursively(prevLayout, payload.widgetId) as SectionData[]);
            EventBus.getInstance().publish('ui-element:deselected');
        };

        const handleRequestSelection = (payload: { type: 'column', id: string }) => {
            if (activeMainView === 'ui-editor') {
                 const colData = findColumnData(uiLayout, payload.id);
                 if (colData) {
                     EventBus.getInstance().publish('ui-element:selected', { type: 'column', data: colData });
                 }
            }
        };

        eventBus.subscribe('ui-section:update-prop', handleSectionPropertyChange);
        eventBus.subscribe('ui-section:column-count-change', handleSectionColumnCountChange);
        eventBus.subscribe('ui-column:update-prop', handleColumnPropertyChange);
        eventBus.subscribe('ui-widget:delete', handleDeleteWidget);
        eventBus.subscribe('ui-element:request-selection', handleRequestSelection);

        return () => {
             eventBus.unsubscribe('ui-section:update-prop', handleSectionPropertyChange);
             eventBus.unsubscribe('ui-section:column-count-change', handleSectionColumnCountChange);
             eventBus.unsubscribe('ui-column:update-prop', handleColumnPropertyChange);
             eventBus.unsubscribe('ui-widget:delete', handleDeleteWidget);
             eventBus.unsubscribe('ui-element:request-selection', handleRequestSelection);
        }
    }, [uiLayout, activeMainView]);

    // --- ECS & Game Loop Initialization ---
    useEffect(() => {
        if (ecsWorld) return;

        // Core ECS Managers
        const entityManager = new EntityManager();
        const componentManager = new ComponentManager();
        const systemManager = new SystemManager(entityManager, componentManager);
        
        // Game Loop
        const gameLoop = new GameLoop(systemManager);
        
        // World
        const world = new World(entityManager, componentManager, systemManager);
        
        // Graph and Interpreter
        const graph = new Graph();
        graphRef.current = graph;
        const graphInterpreter = new GraphInterpreter(graph);

        // Register all library components
        world.registerComponent(PositionComponent);
        world.registerComponent(VelocityComponent);
        world.registerComponent(SpriteComponent);
        world.registerComponent(HealthComponent);
        world.registerComponent(PlayerInputComponent);
        world.registerComponent(PhysicsBodyComponent);
        world.registerComponent(ColliderComponent);
        world.registerComponent(ScoreComponent);
        world.registerComponent(AIPatrolComponent);
        
        // Register core systems with priorities
        const renderingSystem = new RenderingSystem();
        renderingSystemRef.current = renderingSystem;
        systemManager.registerSystem(new PlayerInputSystem(), 100);
        systemManager.registerSystem(new MovementSystem(), 90);
        systemManager.registerSystem(new AIPatrolSystem(), 80);
        systemManager.registerSystem(new PhysicsSystem(), 70);
        systemManager.registerSystem(new HealthSystem(), 60);
        systemManager.registerSystem(new ScoringSystem(entityManager, componentManager), 50);
        systemManager.registerSystem(new LogicSystem(graph, graphInterpreter), 40);
        systemManager.registerSystem(renderingSystem, 10); // Render last

        // Init Project Manager
        ProjectManager.getInstance().init(world, graph);

        setEcsWorld(world);
        if (!gameLoop.isRunning) {
            gameLoop.start();
        }

        return () => {
            if (gameLoop.isRunning) {
                gameLoop.stop();
            }
        };
    }, [ecsWorld]);
    
    const handleRunTests = async (slug?: string): Promise<string> => {
        if (!ecsWorld) return "ECS World not initialized.";

        const logger = new TestLogger();
        const testsToRun: [string, Function][] = slug
            ? [[slug, testRegistry[slug]]]
            : Object.entries(testRegistry);

        for (const [testSlug, testFn] of testsToRun) {
            if (testFn) {
                try {
                    await Promise.resolve(testFn(logger, { world: ecsWorld }));
                } catch (e) {
                    logger.logCustom(`CRITICAL ERROR in test '${testSlug}': ${(e as Error).message}`, "ERROR");
                }
            } else {
                 logger.logCustom(`Test with slug '${testSlug}' not found.`, "WARN");
            }
        }
        return logger.getLog();
    };

    const handleRunAllInitialTests = useCallback(async () => {
        if (hasRunInitialTests.current) return;
        hasRunInitialTests.current = true;
        const results = await handleRunTests();
        console.log("--- Initial System Self-Test Results ---");
        console.log(results);
        localStorage.setItem('test-execution-log', results);
    }, [handleRunTests]);

    useEffect(() => {
        if (ecsWorld && !hasRunInitialTests.current) {
            handleRunAllInitialTests();
        }
    }, [ecsWorld, handleRunAllInitialTests]);

    const handleToggleColliders = () => {
        if(renderingSystemRef.current) {
            renderingSystemRef.current.toggleDebugRendering();
        }
    }
    
     useEffect(() => {
        const renderer = Renderer.getInstance();
        if(renderer.isInitialized) {
            renderer.setGridConfig(gridConfig);
        }
    }, [gridConfig]);

    useEffect(() => {
        const renderer = Renderer.getInstance();
        if(renderer.isInitialized) {
            renderer.setFrameConfig(frameConfig);
        }
    }, [frameConfig]);


    if (!user) {
        return <LoginPage />;
    }
    
    if (isAdminView) {
        return <AdminDashboard onRunTests={handleRunTests} onToggleColliders={handleToggleColliders} onClose={() => setIsAdminView(false)} />;
    }

    return (
        <div style={styles.appContainer}>
            <ProgressBarHeader />
            <Toolbar 
                onSave={handleSaveProject} 
                onLoad={handleLoadProject}
                onPreview={handlePreviewProject}
                onExportHTML={handleExportHTML}
                onUndo={handleUndo} 
                onRedo={handleRedo}
                onLogout={logout}
                onAdminClick={() => setIsAdminView(true)}
                projectName={projectName}
                onProjectNameChange={setProjectName}
                isProjectLive={isProjectLive}
                onIsProjectLiveChange={setIsProjectLive}
                onHelpClick={handleToggleHelpModal}
            />
            <div style={styles.mainContent}>
                <ResizablePanels>
                    <LeftSidebar activeMainView={activeMainView} />
                    <div style={styles.centerPanel}>
                        <MainViewTabs activeTab={activeMainView} onTabChange={setActiveMainView} />
                         {activeMainView === 'ui-editor' && (
                            <div style={styles.globalViewportToolbar}>
                                <ViewportControls 
                                    frameConfig={frameConfig}
                                    onFrameConfigChange={handleFrameConfigChange}
                                    activeLayoutKey={activeLayoutKey}
                                    onLayoutSwitch={handleLayoutSwitch}
                                    onSave={handleSaveProject}
                                />
                            </div>
                        )}
                         <div style={styles.viewportContainer}>
                             {activeMainView === 'scene' && (
                                <CanvasContainer world={ecsWorld} renderingSystem={renderingSystemRef.current} />
                            )}
                            {activeMainView === 'ui-editor' && (
                                <UIEditorPanel
                                    layout={uiLayout}
                                    onLayoutChange={setUiLayout}
                                    widgetManifest={widgetManifest}
                                    onDuplicateSection={handleDuplicateSection}
                                />
                            )}
                             {activeMainView === 'logic-graph' && <LogicGraphPanel />}
                             {activeMainView === 'windows' && <WindowEditorPanel activeMainView={activeMainView} />}
                        </div>
                    </div>
                    <RightSidebar 
                        world={ecsWorld} 
                        frameConfig={frameConfig}
                        onFrameConfigChange={handleFrameConfigChange}
                        isInspectorHelpVisible={isInspectorHelpVisible}
                        onToggleInspectorHelp={toggleInspectorHelp}
                    />
                </ResizablePanels>
            </div>
            {isSettingsPanelOpen && (
                <SettingsPanel 
                    isOpen={isSettingsPanelOpen}
                    onClose={() => setIsSettingsPanelOpen(false)}
                    gridConfig={gridConfig}
                    onGridConfigChange={handleGridConfigChange}
                />
            )}
            {isHelpModalOpen && (
                <Modal isOpen={isHelpModalOpen} onClose={handleToggleHelpModal} title="GameForge Studio - Handbuch">
                    {isManualLoading ? <p>Loading manual...</p> : <div dangerouslySetInnerHTML={{ __html: manualContent || '' }} />}
                </Modal>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    appContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden', // Prevents main content from causing scrollbars
    },
    centerPanel: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
    },
    viewportContainer: {
        flex: 1,
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
    },
    globalViewportToolbar: {
        backgroundColor: '#252526',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid #444',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    },
};

const mainViewTabsStyles: { [key: string]: React.CSSProperties } = {
    mainViewTabsContainer: {
        display: 'flex',
        backgroundColor: '#252526',
        borderBottom: '1px solid #444',
        flexShrink: 0,
    },
    mainViewTab: {
        padding: '0.75rem 1.5rem',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#ccc',
        fontSize: '0.9rem',
    },
    activeMainViewTab: {
        backgroundColor: '#333333',
        color: '#fff',
        borderBottom: '2px solid #007acc',
    },
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
    <React.StrictMode>
        <DebugProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </DebugProvider>
    </React.StrictMode>
);