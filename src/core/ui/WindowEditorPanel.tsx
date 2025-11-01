import React, { useState, useEffect, useRef, useCallback } from 'react';
import TabSystem, { Tab } from './TabSystem';
import { EventBus } from '../ecs/EventBus';
import UIEditorPanel, { SectionData, WidgetData, ColumnData } from './UIEditorPanel';
import { FrameConfig } from '../rendering/Renderer';
import ViewportControls from './ViewportControls';

interface WindowDesign {
    id: string;
    name: string;
    layout: SectionData[];
    frameConfig: FrameConfig;
}

interface WindowEditorPanelProps {
    activeMainView: 'scene' | 'ui-editor' | 'logic-graph' | 'layers' | 'windows';
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


const WindowEditorPanel: React.FC<WindowEditorPanelProps> = ({ activeMainView }) => {
    const [windowDesigns, setWindowDesigns] = useState<Record<string, WindowDesign>>({});
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [widgetManifest, setWidgetManifest] = useState<any>(null);
    const windowCounterRef = useRef(1);

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
        
        setWindowDesigns(prev => ({ ...prev, [newTabId]: newDesign }));
        setActiveTabId(newTabId);

    }, [widgetManifest]);

    // --- Event Bus Subscription ---
    useEffect(() => {
        const eventBus = EventBus.getInstance();
        eventBus.subscribe('window:create-design', handleCreateWindow);
        
        const handleRequestSelection = (payload: { type: 'column', id: string }) => {
            if (activeMainView !== 'windows' || !activeTabId || !windowDesigns[activeTabId]) return;
            
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

            const colData = findColumnDataInLayout(windowDesigns[activeTabId].layout, payload.id);
            if (colData) {
                EventBus.getInstance().publish('ui-element:selected', { type: 'column', data: colData });
            }
        };
        eventBus.subscribe('ui-element:request-selection', handleRequestSelection);

        return () => {
            eventBus.unsubscribe('window:create-design', handleCreateWindow);
            eventBus.unsubscribe('ui-element:request-selection', handleRequestSelection);
        };
    }, [handleCreateWindow, activeTabId, windowDesigns, activeMainView]);
    
    const updateActiveDesign = (updater: (design: WindowDesign) => WindowDesign) => {
        if (activeTabId) {
            setWindowDesigns(prev => ({
                ...prev,
                [activeTabId]: updater(prev[activeTabId]),
            }));
        }
    };
    
    // --- Inspector Event Handlers for the Active Tab ---
    useEffect(() => {
        const eventBus = EventBus.getInstance();
        if (!activeTabId || activeMainView !== 'windows') return;

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
    }, [activeTabId, activeMainView]);


    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedType = e.dataTransfer.getData('text/plain');
        handleCreateWindow(droppedType);
    };

    const activeDesign = activeTabId ? windowDesigns[activeTabId] : null;

    const tabs: Tab[] = Object.values(windowDesigns).map(design => ({
        id: design.id,
        label: design.name,
        content: <></> // Content is rendered outside TabSystem
    }));

    const finalTabs = tabs.length > 0 ? tabs : [
        { id: 'placeholder', label: 'No Windows Open', content: <></> }
    ];

    return (
        <div style={styles.container}>
            <TabSystem tabs={finalTabs} onTabChange={(tab) => setActiveTabId(tab.id === 'placeholder' ? null : tab.id)} />

            {activeDesign && (
                 <div style={styles.viewportToolbar}>
                    <ViewportControls 
                        frameConfig={activeDesign.frameConfig}
                        onFrameConfigChange={(newConfig) => updateActiveDesign(d => ({...d, frameConfig: {...d.frameConfig, ...newConfig}}))}
                        activeLayoutKey={'default'} // Placeholder
                        onLayoutSwitch={() => {}} // Placeholder
                        onSave={() => {}} // Placeholder
                    />
                </div>
            )}
            
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
                    <div 
                        style={styles.placeholderContainer}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <p style={styles.placeholderText}>Drag a window type (e.g., Modal Window) from the Library<br/>onto this panel to create a new window design.</p>
                    </div>
                )}
            </div>
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
     viewportToolbar: {
        backgroundColor: '#252526',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid #444',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    }
};

export default WindowEditorPanel;