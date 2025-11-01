import React, { useState, useEffect, useRef, useCallback } from 'react';
import TabSystem, { Tab } from './TabSystem';
import { EventBus } from '../ecs/EventBus';
import UIEditorPanel, { SectionData, WidgetData, ColumnData } from './UIEditorPanel';
import { FrameConfig } from '../rendering/Renderer';
import WidgetPicker from './WidgetPicker';
import { WindowDesign } from '../project/IProject';

interface WindowEditorPanelProps {
    activeMainView: 'scene' | 'ui-editor' | 'logic-graph' | 'layers' | 'windows';
    windowDesigns: Record<string, WindowDesign>;
    activeDesignId: string | null;
    onDesignsChange: React.Dispatch<React.SetStateAction<Record<string, WindowDesign>>>;
    onActiveDesignIdChange: React.Dispatch<React.SetStateAction<string | null>>;
}

const defaultFrameConfig: FrameConfig = {
    isVisible: true,
    width: 800,
    height: 600,
    color: 0x666666,
    orientation: 'landscape',
    autoHeight: false,
};

// Helper function to recursively remove a widget from the layout
const removeWidgetRecursively = (items: (WidgetData | SectionData)[], widgetId: string): (WidgetData | SectionData)[] => {
    return items.filter(item => item.id !== widgetId).map(item => {
        if ('componentType' in item) {
            return item;
        }
        const section = item as SectionData;
        const updatedColumns = section.columns.map(col => ({
            ...col,
            widgets: removeWidgetRecursively(col.widgets, widgetId)
        }));
        return { ...section, columns: updatedColumns };
    });
};


const WindowEditorPanel: React.FC<WindowEditorPanelProps> = ({ 
    activeMainView,
    windowDesigns,
    activeDesignId,
    onDesignsChange,
    onActiveDesignIdChange,
}) => {
    const [widgetManifest, setWidgetManifest] = useState<any>(null);
    const windowCounterRef = useRef(Object.keys(windowDesigns).length + 1);
    const [pickerState, setPickerState] = useState<{ anchorEl: HTMLElement } | null>(null);

    useEffect(() => {
        const fetchManifest = async () => {
            try {
                const response = await fetch('./src/core/assets/ui-widget-manifest.json');
                if (!response.ok) throw new Error('Failed to fetch widget manifest');
                const data = await response.json();
                setWidgetManifest(data);
            } catch (error) {
                console.error("Error loading widget manifest:", error);
            }
        };
        fetchManifest();
    }, []);
    
    const handleCreateWindow = useCallback((id: string) => {
        if (!widgetManifest) return;

        const widgetDef = widgetManifest.widgets.find((w: any) => w.id === id);
        if (!widgetDef || widgetDef.category !== 'Windows') return;

        const newIdCounter = windowCounterRef.current++;
        const newTabId = `${id}-${newIdCounter}`;
        const newTabLabel = `${widgetDef.name} ${newIdCounter}`;

        const newDesign: WindowDesign = {
            id: newTabId,
            name: newTabLabel,
            layout: [],
            frameConfig: { ...defaultFrameConfig },
        };
        
        onDesignsChange(prev => ({ ...prev, [newTabId]: newDesign }));
        onActiveDesignIdChange(newTabId);

    }, [widgetManifest, onDesignsChange, onActiveDesignIdChange]);

    // --- Event Bus Subscription ---
    useEffect(() => {
        const eventBus = EventBus.getInstance();
        eventBus.subscribe('window:create-design', handleCreateWindow);
        
        const handleRequestSelection = (payload: { type: 'column', id: string }) => {
            if (activeMainView !== 'windows' || !activeDesignId || !windowDesigns[activeDesignId]) return;
            
            const findColumnDataInLayout = (layout: SectionData[], columnId: string | null): ColumnData | null => {
                if (!columnId) return null;
                for (const section of layout) {
                    const column = section.columns.find(c => c.id === columnId);
                    if (column) return column;
                    for (const col of section.columns) {
                        for (const item of col.widgets) {
                            if (!('componentType' in item)) {
                                const found = findColumnDataInLayout([item], columnId);
                                if (found) return found;
                            }
                        }
                    }
                }
                return null;
            };

            const colData = findColumnDataInLayout(windowDesigns[activeDesignId].layout, payload.id);
            if (colData) {
                EventBus.getInstance().publish('ui-element:selected', { type: 'column', data: colData });
            }
        };
        eventBus.subscribe('ui-element:request-selection', handleRequestSelection);

        return () => {
            eventBus.unsubscribe('window:create-design', handleCreateWindow);
            eventBus.unsubscribe('ui-element:request-selection', handleRequestSelection);
        };
    }, [handleCreateWindow, activeDesignId, windowDesigns, activeMainView]);
    
    const updateActiveDesign = (updater: (design: WindowDesign) => WindowDesign) => {
        if (activeDesignId) {
            onDesignsChange(prev => ({
                ...prev,
                [activeDesignId]: updater(prev[activeDesignId]),
            }));
        }
    };
    
    // --- Inspector Event Handlers for the Active Tab ---
    useEffect(() => {
        const eventBus = EventBus.getInstance();
        if (!activeDesignId || activeMainView !== 'windows') return;

        const handleSectionPropertyChange = (payload: { sectionId: string, propName: string, value: any }) => {
            updateActiveDesign(d => {
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
                return { ...d, layout: updateRecursively(d.layout) as SectionData[]};
            });
        };
        const handleSectionColumnCountChange = (payload: { sectionId: string, count: number }) => {
             updateActiveDesign(d => {
                const updateRecursively = (items: (WidgetData | SectionData)[]): (WidgetData | SectionData)[] => {
                    return items.map(item => {
                        if ('componentType' in item) return item;
                        const section = item as SectionData;
                        if (section.id === payload.sectionId) {
                            let newColumns = [...section.columns];
                            if (payload.count > newColumns.length) {
                                for (let i = newColumns.length; i < payload.count; i++) newColumns.push({ id: crypto.randomUUID(), widgets: [], styles: {} });
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
                return {...d, layout: updateRecursively(d.layout) as SectionData[]};
            });
        };
        const handleColumnPropertyChange = (payload: { columnId: string, propName: string, value: any }) => {
            updateActiveDesign(d => {
                const newLayout = JSON.parse(JSON.stringify(d.layout));
                const findAndApply = (secs: SectionData[]) => secs.some(s => s.columns.some(c => {
                    if (c.id === payload.columnId) { c.styles = { ...c.styles, [payload.propName]: payload.value }; return true; }
                    return findAndApply(c.widgets.filter(w => !('componentType' in w)) as SectionData[]);
                }));
                findAndApply(newLayout);
                return { ...d, layout: newLayout };
            });
        };
        const handleDeleteWidget = (payload: { widgetId: string }) => {
            updateActiveDesign(d => ({...d, layout: removeWidgetRecursively(d.layout, payload.widgetId) as SectionData[] }));
            EventBus.getInstance().publish('ui-element:deselected');
        };

        eventBus.subscribe('ui-section:update-prop', handleSectionPropertyChange);
        eventBus.subscribe('ui-section:column-count-change', handleSectionColumnCountChange);
        eventBus.subscribe('ui-column:update-prop', handleColumnPropertyChange);
        eventBus.subscribe('ui-widget:delete', handleDeleteWidget);
        
        return () => {
            eventBus.unsubscribe('ui-section:update-prop', handleSectionPropertyChange);
            eventBus.unsubscribe('ui-section:column-count-change', handleSectionColumnCountChange);
            eventBus.unsubscribe('ui-column:update-prop', handleColumnPropertyChange);
            eventBus.unsubscribe('ui-widget:delete', handleDeleteWidget);
        };
    }, [activeDesignId, activeMainView, onDesignsChange]);

    const handleOpenPicker = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setPickerState({ anchorEl: e.currentTarget });
    };

    const handlePickerSelect = (widgetType: string) => {
        handleCreateWindow(widgetType);
        setPickerState(null);
    };

    const handleCloseTab = (tabIdToClose: string) => {
        onDesignsChange(prev => {
            const newDesigns = { ...prev };
            delete newDesigns[tabIdToClose];
            return newDesigns;
        });

        if (activeDesignId === tabIdToClose) {
            const remainingIds = Object.keys(windowDesigns).filter(id => id !== tabIdToClose);
            onActiveDesignIdChange(remainingIds[0] || null);
        }
    };

    const activeDesign = activeDesignId ? windowDesigns[activeDesignId] : null;

    const tabs: Tab[] = Object.values(windowDesigns).map(design => ({
        id: design.id,
        label: design.name,
        content: <></>,
        onClose: () => handleCloseTab(design.id),
    }));

    return (
        <div style={styles.container}>
            <div style={styles.tabBarContainer}>
                <TabSystem 
                    tabs={tabs} 
                    onTabChange={(tab) => onActiveDesignIdChange(tab.id)}
                />
                <button 
                    onClick={handleOpenPicker}
                    style={styles.newTabButton}
                    title="Create a new window design"
                >
                    +
                </button>
            </div>
            
            <div style={styles.contentArea}>
                {activeDesign ? (
                    <UIEditorPanel
                        key={activeDesign.id}
                        layout={activeDesign.layout}
                        onLayoutChange={newLayout => updateActiveDesign(d => ({ ...d, layout: newLayout }))}
                        widgetManifest={widgetManifest}
                        onDuplicateSection={() => {}}
                    />
                ) : (
                    <div style={styles.placeholderContainer}>
                        <p style={styles.placeholderText}>Click the '+' to create a new window design.</p>
                    </div>
                )}
            </div>
            {pickerState && widgetManifest && (
                <WidgetPicker
                    widgetManifest={{
                        ...widgetManifest,
                        widgets: widgetManifest.widgets.filter((w: any) => w.category === 'Windows')
                    }}
                    anchorEl={pickerState.anchorEl}
                    onSelect={handlePickerSelect}
                    onClose={() => setPickerState(null)}
                />
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1e1e1e',
    },
    tabBarContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        backgroundColor: '#252526',
        borderBottom: '1px solid #444',
        paddingLeft: '0.5rem',
        gap: '4px',
        flexShrink: 0,
    },
    newTabButton: {
        padding: '0.6rem 1rem',
        cursor: 'pointer',
        backgroundColor: '#3e3e42',
        border: '1px solid #555',
        borderBottom: 'none',
        color: '#ccc',
        fontSize: '0.9rem',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        marginLeft: '4px',
        alignSelf: 'flex-start',
        marginTop: '5px',
    },
    contentArea: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
    },
    placeholderContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#252526',
    },
    placeholderText: {
        padding: '1rem',
        color: '#999',
        textAlign: 'center',
    },
};

export default WindowEditorPanel;