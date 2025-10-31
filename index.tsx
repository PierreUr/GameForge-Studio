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
import ViewportControls from './src/core/ui/ViewportControls';

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
        setUiLayout(prevLayout => {
            const updateRecursively = (items: (WidgetData | SectionData)[]): (WidgetData | SectionData)[] => {
                return items.map(item => {
                    if ('componentType' in item) {
                        return item; // It's a widget, skip
                    }
                    const section = item as SectionData;
                    if (section.id === sectionId) {
                        // Found it, apply update
                        return { ...section, [propName]: propValue };
                    }
                    // Not it, recurse into its columns
                    const updatedColumns = section.columns.map(col => ({
                        ...col,
                        widgets: updateRecursively(col.widgets)
                    }));
                    return { ...section, columns: updatedColumns };
                });
            };
            return updateRecursively(prevLayout) as SectionData[];
        });
    }, []);

    const handleSectionColumnCountChange = useCallback((sectionId: string, newColumnCount: number) => {
        const updateRecursively = (items: (WidgetData | SectionData)[]): (WidgetData | SectionData)[] => {
            return items.map(item => {
                if ('componentType' in item) {
                    return item; // It's a widget, return as is
                }
    
                const section = item as SectionData;
    
                if (section.id === sectionId) {
                    // This is the target section, perform the update
                    let newColumns = [...section.columns];
                    if (newColumnCount > newColumns.length) {
                        for (let i = newColumns.length; i < newColumnCount; i++) {
                            newColumns.push({ id: crypto.randomUUID(), widgets: [], styles: { backgroundColor: 'transparent', padding: '0px', rowGap: 8 } });
                        }
                    } else if (newColumnCount < newColumns.length) {
                        const widgetsToMove = newColumns.slice(newColumnCount).flatMap(col => col.widgets);
                        newColumns = newColumns.slice(0, newColumnCount);
                        if (newColumns.length > 0) {
                            newColumns[newColumns.length - 1].widgets.push(...widgetsToMove);
                        }
                    }
                    return { ...section, columnLayout: newColumnCount, columns: newColumns };
                } else {
                    // Not the target section, recurse into its columns
                    const updatedColumns = section.columns.map(col => ({
                        ...col,
                        widgets: updateRecursively(col.widgets)
                    }));
                    return { ...section, columns: updatedColumns };
                }
            });
        };
    
        setUiLayout(prevLayout => updateRecursively(prevLayout) as SectionData[]);
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

    const handleSaveProject = useCallback(() => {
        console.log(`[App] handleSaveProject triggered`);
        if (projectName && projectName.trim() !== "") {
            // FIX: Pass the project's live status to the save function.
            ProjectManager.getInstance().saveProject(uiLayout, projectName.trim(), isProjectLive);
        } else {
             console.log('[App] Save cancelled or project name was empty.');
        }
    }, [uiLayout, projectName, isProjectLive]);

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

    const handleLayoutSwitch = useCallback((newLayoutKey: string) => {
        if (!ecsWorld) return;
        const pm = ProjectManager.getInstance();
        const { ecsState, uiState } = pm.switchActiveLayout(newLayoutKey, uiLayout);
    
        if (ecsState) {
            ecsWorld.loadProjectState(ecsState);
        }
        setUiLayout(uiState || []); // Ensure uiState is never null/undefined
        setActiveLayoutKey(newLayoutKey);
    }, [ecsWorld, uiLayout]);

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
                // autoSaveInterval = projectManager.startAutoSave(30000); // Auto-save every 30 seconds

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

        // FIX: Update handler to receive and set the project's 'live' status.
        const handleProjectLoaded = (payload: { activeLayoutKey: string, uiState: SectionData[], isLive?: boolean }) => {
            const loadedKey = payload.activeLayoutKey;
            setUiLayout(payload.uiState || []);
            setActiveLayoutKey(loadedKey);
            setIsProjectLive(payload.isLive ?? false); // Set live status
            
            if (loadedKey === 'default') {
                setFrameConfig(prev => ({ ...prev, isVisible: false }));
            } else {
                const presetName = Object.keys(devicePresets).find(key => key.toLowerCase() === loadedKey);
                const preset = presetName ? devicePresets.find(p => p.name === presetName) : undefined;
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
        
        // FIX: Replaced the non-recursive function with a recursive one to handle nested sections.
        // This also adds a type guard to safely access the `props` property on widgets, resolving the TypeScript error.
        const handleWidgetPropertyUpdate = (payload: { widgetId: string, propName: string, propValue: any }) => {
            setUiLayout(prevLayout => {
                function recursiveUpdate(items: (WidgetData | SectionData)[]): (WidgetData | SectionData)[] {
                    return items.map(item => {
                        if (item.id === payload.widgetId && 'componentType' in item) {
                            // This is the widget we want to update
                            if (payload.propName === 'styles') {
                                return { ...item, styles: payload.propValue };
                            }
                            return {
                                ...item,
                                props: { ...item.props, [payload.propName]: payload.propValue }
                            };
                        } else if (!('componentType' in item)) { // This is a SectionData, recurse into its columns
                            return {
                                ...item,
                                columns: item.columns.map(col => ({
                                    ...col,
                                    widgets: recursiveUpdate(col.widgets)
                                }))
                            };
                        }
                        // This is a different widget, return as is
                        return item;
                    });
                }
                return recursiveUpdate(prevLayout) as SectionData[];
            });
        };
        
        const handleWidgetDelete = (payload: { widgetId: string }) => {
            setUiLayout(prevLayout => {
                const recursiveFilter = (items: (WidgetData | SectionData)[]): (WidgetData | SectionData)[] => {
                    return items
                        .filter(item => item.id !== payload.widgetId)
                        .map(item => {
                            if (!('componentType' in item)) { // is SectionData
                                const section = item as SectionData;
                                return {
                                    ...section,
                                    columns: section.columns.map(col => ({
                                        ...col,
                                        widgets: recursiveFilter(col.widgets)
                                    }))
                                };
                            }
                            return item;
                        });
                };
                return recursiveFilter(prevLayout) as SectionData[];
            });
            handleWidgetSelect(null);
        };
        
        // FIX: Corrected the `findAndInsertRecursive` function to properly traverse nested sections, enabling drag-and-drop into any level of the layout.
        const handleWidgetMove = (payload: { source: any; target: any }) => {
            setUiLayout(prevLayout => {
                const newLayout = JSON.parse(JSON.stringify(prevLayout)); // Deep copy for safe mutation
                let foundWidget: WidgetData | SectionData | null = null;
        
                function findAndRemoveRecursive(items: (WidgetData | SectionData)[]): boolean {
                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        if (item.id === payload.source.widgetId) {
                            [foundWidget] = items.splice(i, 1);
                            return true;
                        }
                        if (!('componentType' in item)) { // is SectionData
                            for (const column of (item as SectionData).columns) {
                                if (findAndRemoveRecursive(column.widgets)) {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                }
        
                function findAndInsertRecursive(items: (WidgetData | SectionData)[]): boolean {
                    for (const item of items) {
                        if ('componentType' in item) {
                            continue; // It's a widget, cannot insert here.
                        }
                        
                        const section = item as SectionData;
                        if (section.id === payload.target.targetSectionId) {
                            const column = section.columns[payload.target.targetColumnIndex];
                            if (column) {
                                column.widgets.splice(payload.target.targetDropIndex, 0, foundWidget!);
                                return true; // Insertion complete
                            }
                        } else {
                            // Recurse into this section's columns
                            for (const column of section.columns) {
                                if (findAndInsertRecursive(column.widgets)) {
                                    return true; // Insertion happened in a nested section
                                }
                            }
                        }
                    }
                    return false; // Target not found at this level
                }
        
                findAndRemoveRecursive(newLayout);
        
                if (foundWidget) {
                    if (findAndInsertRecursive(newLayout)) {
                        return newLayout;
                    }
                }
        
                return prevLayout; // No change if widget not found or insert failed
            });
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
                    onSave={handleSaveProject}
                    onLoad={() => ProjectManager.getInstance().loadProject()}
                    onPreview={() => ProjectManager.getInstance().previewProject(uiLayout)}
                    onExportHTML={() => ProjectManager.getInstance().exportToStandaloneHTML(uiLayout)}
                    onUndo={() => CommandManager.getInstance().undo()}
                    onRedo={() => CommandManager.getInstance().redo()}
                    onLogout={logout}
                    onAdminClick={() => setIsAdminView(true)}
                    projectName={projectName}
                    onProjectNameChange={setProjectName}
                    isProjectLive={isProjectLive}
                    onIsProjectLiveChange={setIsProjectLive}
                />
                <ResizablePanels>
                    <LeftSidebar />
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1e1e1e', minWidth: 0, flex: 1 }}>
                        <MainViewTabs activeTab={activeMainView} onTabChange={setActiveMainView} />
                        {(activeMainView === 'scene' || activeMainView === 'ui-editor') && (
                            <div style={viewportToolbarStyles.container}>
                                <ViewportControls 
                                    frameConfig={frameConfig}
                                    onFrameConfigChange={handleFrameConfigChange}
                                    activeLayoutKey={activeLayoutKey}
                                    onLayoutSwitch={handleLayoutSwitch}
                                    onSave={handleSaveProject}
                                />
                                <div style={{ flex: 1 }} /> {/* Spacer */}
                                <button onClick={() => setIsSettingsPanelOpen(true)} style={viewportToolbarStyles.settingsButton} aria-label="Open Settings">
                                    ⚙️
                                </button>
                            </div>
                        )}
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

const viewportToolbarStyles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#252526',
        borderBottom: '1px solid #000',
        flexShrink: 0,
        padding: '4px 10px',
    },
    settingsButton: {
        backgroundColor: 'rgba(45, 45, 45, 0.75)',
        border: '1px solid #666',
        color: '#eee',
        cursor: 'pointer',
        borderRadius: '4px',
        fontSize: '1.2rem',
        width: '36px',
        height: '36px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background-color 0.2s'
    }
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