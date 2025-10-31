

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

    const handleSectionColumnCountChange = useCallback((sectionId: string, newColumnCount: number) => {
        setUiLayout(prevLayout =>
            prevLayout.map(section => {
                if (section.id === sectionId) {
                    let newColumns = [...section.columns];
                    if (newColumnCount > newColumns.length) {
                        // Add new columns
                        for (let i = newColumns.length; i < newColumnCount; i++) {
                            newColumns.push({ id: crypto.randomUUID(), widgets: [], styles: { backgroundColor: 'transparent', padding: '0px', rowGap: 8 } });
                        }
                    } else if (newColumnCount < newColumns.length) {
                        // Consolidate widgets from removed columns into the last remaining column
                        const widgetsToMove = newColumns.slice(newColumnCount).flatMap(col => col.widgets);
                        newColumns = newColumns.slice(0, newColumnCount);
                        if (newColumns.length > 0) {
                            newColumns[newColumns.length - 1].widgets.push(...widgetsToMove);
                        }
                    }
                    return { ...section, columnLayout: newColumnCount, columns: newColumns };
                }
                return section;
            })
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

    // FIX: Implemented the missing `handleRunTests` function.
    const handleRunTests = useCallback(async (slug?: string): Promise<string> => {
        const logger = new TestLogger();
        
        if (!ecsWorld) {
            const msg = "ECS World not initialized. Cannot run tests.";
            logger.logCustom(msg, 'ERROR');
            return logger.getLog();
        }
        
        const deps = { world: ecsWorld };

        const runTest = async (slugToRun: string, testFn: (logger: TestLogger, deps: { world: World }) => Promise<void> | void) => {
             try {
                await testFn(logger, deps);
            } catch (e: any) {
                logger.logCustom(`CRITICAL ERROR in test '${slugToRun}': ${e.message}`, "ERROR");
            }
        };

        if (slug) {
            const testFn = testRegistry[slug];
            if (testFn) {
                await runTest(slug, testFn);
            } else {
                logger.logCustom(`Test with slug "${slug}" not found.`, "WARN");
            }
        } else {
            for (const [testSlug, testFn] of Object.entries(testRegistry)) {
               await runTest(testSlug, testFn);
            }
        }
        
        const fullLog = logger.getLog();
        
        try {
            localStorage.setItem('test-execution-log', fullLog);
        } catch (e) {
            console.error("Failed to save test execution log to localStorage:", e);
        }

        return fullLog;
    }, [ecsWorld]);
    
    const handleDuplicateSection = useCallback((sectionId: string) => {
        const sectionToDuplicate = uiLayout.find(s => s.id === sectionId);
        if (!sectionToDuplicate) return;

        // Deep copy to prevent reference issues
        const duplicateSection = JSON.parse(JSON.stringify(sectionToDuplicate));

        // Generate new IDs for all nested elements
        duplicateSection.id = crypto.randomUUID();
        duplicateSection.columns.forEach((col: ColumnData) => {
            col.id = crypto.randomUUID();
            col.widgets.forEach((w: WidgetData) => {
                w.id = crypto.randomUUID();
            });
        });

        const originalIndex = uiLayout.findIndex(s => s.id === sectionId);
        const newLayout = [...uiLayout];
        newLayout.splice(originalIndex + 1, 0, duplicateSection);
        setUiLayout(newLayout);
    }, [uiLayout]);

    // Restore Ctrl+D functionality for duplicating sections
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
                const activeEl = document.activeElement;
                const isInputFocused = activeEl && (
                    activeEl.tagName === 'INPUT' || 
                    activeEl.tagName === 'TEXTAREA' || 
                    (activeEl as HTMLElement).isContentEditable
                );

                if (!isInputFocused && selectedSectionId) {
                    e.preventDefault();
                    handleDuplicateSection(selectedSectionId);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedSectionId, handleDuplicateSection]);


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
        
        // FIX: Fixed truncated and buggy function.
        // It now correctly handles updates to a widget's `props` or `styles` object and ensures
        // the map function always returns a widget to prevent type errors.
        const handleWidgetPropertyUpdate = (payload: { widgetId: string, propName: string, propValue: any }) => {
            setUiLayout(prevLayout => {
                return prevLayout.map(section => ({
                    ...section,
                    columns: section.columns.map(column => ({
                        ...column,
                        widgets: column.widgets.map(widget => {
                            if (widget.id === payload.widgetId) {
                                if (payload.propName === 'styles') {
                                    return {
                                        ...widget,
                                        styles: payload.propValue
                                    };
                                }
                                return {
                                    ...widget,
                                    props: {
                                        ...widget.props,
                                        [payload.propName]: payload.propValue
                                    }
                                };
                            }
                            return widget;
                        })
                    }))
                }));
            });
        };
        
        const handleWidgetDelete = (payload: { widgetId: string }) => {
            setUiLayout(prevLayout =>
                prevLayout.map(section => ({
                    ...section,
                    columns: section.columns.map(column => ({
                        ...column,
                        widgets: column.widgets.filter(widget => widget.id !== payload.widgetId),
                    })),
                }))
            );
            handleWidgetSelect(null); // Deselect deleted widget
        };
        
        const handleWidgetMove = (payload: { source: any; target: any }) => {
            let widgetToMove: WidgetData | null = null;
            let newLayout = [...uiLayout];

            // 1. Find and remove the widget from the source column
            newLayout = newLayout.map(section => {
                if (section.id === payload.source.sourceSectionId) {
                    const newColumns = section.columns.map((col, index) => {
                        if (index === payload.source.sourceColumnIndex) {
                            const widgetIndex = col.widgets.findIndex(w => w.id === payload.source.widgetId);
                            if (widgetIndex > -1) {
                                const newWidgets = [...col.widgets];
                                [widgetToMove] = newWidgets.splice(widgetIndex, 1);
                                return { ...col, widgets: newWidgets };
                            }
                        }
                        return col;
                    });
                    return { ...section, columns: newColumns };
                }
                return section;
            });

            // 2. Add the widget to the target column at the correct index
            if (widgetToMove) {
                newLayout = newLayout.map(section => {
                    if (section.id === payload.target.targetSectionId) {
                        const newColumns = section.columns.map((col, index) => {
                            if (index === payload.target.targetColumnIndex) {
                                const newWidgets = [...col.widgets];
                                newWidgets.splice(payload.target.targetDropIndex, 0, widgetToMove!);
                                return { ...col, widgets: newWidgets };
                            }
                            return col;
                        });
                        return { ...section, columns: newColumns };
                    }
                    return section;
                });
            }
            setUiLayout(newLayout);
        };
        
        const eventBus = EventBus.getInstance();
        eventBus.subscribe('project:loaded', handleProjectLoaded);
        eventBus.subscribe('ui-widget:update-prop', handleWidgetPropertyUpdate);
        eventBus.subscribe('ui-widget:delete', handleWidgetDelete);
        eventBus.subscribe('ui-widget:move', handleWidgetMove);

        return () => {
            eventBus.unsubscribe('project:loaded', handleProjectLoaded);
            eventBus.unsubscribe('ui-widget:update-prop', handleWidgetPropertyUpdate);
            eventBus.unsubscribe('ui-widget:delete', handleWidgetDelete);
            eventBus.unsubscribe('ui-widget:move', handleWidgetMove);
            if (gameLoop && gameLoop.isRunning) {
                gameLoop.stop();
            }
            if (autoSaveInterval) {
                clearInterval(autoSaveInterval);
            }
        };
    }, [token, gridConfig, frameConfig, handleRunTests, handleWidgetSelect, uiLayout, handleDuplicateSection, selectedSectionId]);

    if (!token) {
        return <LoginPage />;
    }

    if (isAdminView) {
        return <AdminDashboard 
            onRunTests={handleRunTests} 
            onToggleColliders={() => {
                renderingSystemRef.current?.toggleDebugRendering();
            }} 
            onClose={() => setIsAdminView(false)} 
        />;
    }

    let mainContent;
    switch (activeMainView) {
        case 'scene':
            mainContent = <CanvasContainer 
                world={ecsWorld} 
                renderingSystem={renderingSystemRef.current} 
                frameConfig={frameConfig} 
                // FIX: Pass the wrapper function instead of the raw setState function to match the expected prop type.
                onFrameConfigChange={handleFrameConfigChange} 
                onOpenSettingsPanel={() => setIsSettingsPanelOpen(true)} 
            />;
            break;
        case 'ui-editor':
            mainContent = <UIEditorPanel 
                layout={uiLayout} 
                onLayoutChange={setUiLayout}
                selectedWidgetId={selectedWidgetId}
                onWidgetSelect={handleWidgetSelect}
                selectedSectionId={selectedSectionId}
                onSectionSelect={handleSectionSelect}
                selectedColumnId={selectedColumnId}
                onColumnSelect={handleColumnSelect}
                onDuplicateSection={handleDuplicateSection}
                onSectionColumnCountChange={handleSectionColumnCountChange}
            />;
            break;
        case 'logic-graph':
            mainContent = <LogicGraphPanel />;
            break;
        case 'layers':
            mainContent = <div>Layers Panel Placeholder</div>;
            break;
        default:
            mainContent = <div>Error: Unknown View</div>;
    }

    return (
        <DebugProvider>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e1e', color: '#ccc' }}>
                <ProgressBarHeader />
                <Toolbar 
                    onSave={() => ProjectManager.getInstance().saveProject()}
                    onLoad={() => ProjectManager.getInstance().loadProject()}
                    onPreview={() => ProjectManager.getInstance().previewProject()}
                    onExportHTML={() => ProjectManager.getInstance().exportToStandaloneHTML()}
                    onUndo={() => CommandManager.getInstance().undo()}
                    onRedo={() => CommandManager.getInstance().redo()}
                    onLogout={logout}
                    onAdminClick={() => setIsAdminView(true)}
                />
                <ResizablePanels>
                    <LeftSidebar />
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1e1e1e', minWidth: 0, flex: 1 }}>
                        <MainViewTabs activeTab={activeMainView} onTabChange={setActiveMainView} />
                        <div style={{ flex: 1, display: 'flex', position: 'relative', minHeight: 0 }}>
                            {mainContent}
                        </div>
                    </div>
                    <RightSidebar 
                        world={ecsWorld} 
                        frameConfig={frameConfig} 
                        // FIX: Pass the wrapper function instead of the raw setState function to match the expected prop type.
                        onFrameConfigChange={handleFrameConfigChange}
                        uiLayout={uiLayout}
                        selectedWidgetId={selectedWidgetId}
                        selectedSectionId={selectedSectionId}
                        onSectionPropertyChange={handleSectionPropertyChange}
                        onSectionColumnCountChange={handleSectionColumnCountChange}
                        selectedColumnId={selectedColumnId}
                        onColumnPropertyChange={handleColumnPropertyChange}
                        onColumnSelect={handleColumnSelect}
                        isInspectorHelpVisible={isInspectorHelpVisible}
                        onToggleInspectorHelp={toggleInspectorHelp}
                    />
                </ResizablePanels>
                {isSettingsPanelOpen && (
                    <SettingsPanel 
                        isOpen={isSettingsPanelOpen}
                        onClose={() => setIsSettingsPanelOpen(false)}
                        gridConfig={gridConfig}
                        // FIX: Pass the wrapper function instead of the raw setState function to match the expected prop type.
                        onGridConfigChange={handleGridConfigChange}
                    />
                )}
            </div>
        </DebugProvider>
    );
};

// FIX: Added the missing styles object for the MainViewTabs component.
const mainViewTabsStyles: { [key: string]: React.CSSProperties } = {
    mainViewTabsContainer: {
        display: 'flex',
        backgroundColor: '#252526',
        borderBottom: '1px solid #000',
        flexShrink: 0,
    },
    mainViewTab: {
        padding: '0.75rem 1.5rem',
        cursor: 'pointer',
        backgroundColor: '#2d2d2d',
        border: 'none',
        color: '#aaa',
        fontSize: '0.9rem',
        borderRight: '1px solid #000',
        outline: 'none',
    },
    activeMainViewTab: {
        backgroundColor: '#3e3e42',
        color: '#fff',
    }
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);