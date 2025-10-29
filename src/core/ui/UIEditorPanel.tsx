import React, { useCallback, useRef, useEffect, useState } from 'react';
import TaskListWidget from './widgets/TaskListWidget';
import CreateTaskFormWidget from './widgets/CreateTaskFormWidget';
import HeadingWidget from './widgets/HeadingWidget';
import Section from './layout/Section';
import { EventBus } from '../ecs/EventBus';
import SpacerWidget from './widgets/SpacerWidget';

// --- DATA TYPES for the new Layout System ---
export interface WidgetData {
    id: string;
    componentType: string;
    props: Record<string, any>;
}
export interface ColumnData {
    id: string;
    widgets: WidgetData[];
}
export interface SectionData {
    id: string;
    columnLayout: number;
    columns: ColumnData[];
}

interface UIEditorPanelProps {
    layout: SectionData[];
    onLayoutChange: (newLayout: SectionData[]) => void;
    selectedWidgetId: string | null;
    onWidgetSelect: (widgetId: string | null) => void;
}

// A map to resolve component names from the manifest to actual React components
export const componentRegistry: Record<string, React.ComponentType<any>> = {
    'task-list': TaskListWidget,
    'create-task-form': CreateTaskFormWidget,
    'heading': HeadingWidget,
    'spacer': SpacerWidget,
};

const UIEditorPanel: React.FC<UIEditorPanelProps> = ({ layout, onLayoutChange, selectedWidgetId, onWidgetSelect }) => {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const lastPanPoint = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [widgetManifest, setWidgetManifest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchManifest = async () => {
            try {
                const response = await fetch('./src/core/assets/ui-widget-manifest.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch widget manifest');
                }
                const data = await response.json();
                setWidgetManifest(data);
            } catch (error) {
                console.error("Error loading widget manifest:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchManifest();
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedType = e.dataTransfer.getData('text/plain');
        
        if (droppedType === 'layout-section') {
            const newSection: SectionData = {
                id: crypto.randomUUID(),
                columnLayout: 1,
                columns: [{ id: crypto.randomUUID(), widgets: [] }],
            };
            onLayoutChange([...layout, newSection]);
        }
    }, [layout, onLayoutChange]);

    const handleWidgetDrop = useCallback((sectionId: string, columnIndex: number, widgetType: string) => {
        if (!widgetManifest || widgetType === 'layout-section' || !componentRegistry[widgetType]) return;

        const widgetDef = widgetManifest.widgets.find((w: any) => w.id === widgetType);
        const defaultProps = widgetDef?.properties.reduce((acc: any, prop: any) => {
            acc[prop.name] = prop.defaultValue;
            return acc;
        }, {} as Record<string, any>) || {};

        const newWidget: WidgetData = {
            id: crypto.randomUUID(),
            componentType: widgetType,
            props: defaultProps,
        };

        const newLayout = layout.map(section => {
            if (section.id === sectionId) {
                const newColumns = section.columns.map((col, index) => {
                    if (index === columnIndex) {
                        return { ...col, widgets: [...col.widgets, newWidget] };
                    }
                    return col;
                });
                return { ...section, columns: newColumns };
            }
            return section;
        });
        onLayoutChange(newLayout);
    }, [widgetManifest, layout, onLayoutChange]);

    const handleLayoutChange = useCallback((sectionId: string, newColumnCount: number) => {
        const newLayout = layout.map(section => {
            if (section.id === sectionId) {
                let newColumns = [...section.columns];
                if (newColumnCount > newColumns.length) {
                    for (let i = newColumns.length; i < newColumnCount; i++) {
                        newColumns.push({ id: crypto.randomUUID(), widgets: [] });
                    }
                } else if (newColumnCount < newColumns.length) {
                    const widgetsToMove = newColumns.slice(newColumnCount).flatMap(col => col.widgets);
                    newColumns = newColumns.slice(0, newColumnCount);
                    if (newColumns.length > 0) {
                        newColumns[newColumns.length - 1].widgets.push(...widgetsToMove);
                    }
                }
                return { ...section, columnLayout: newColumnCount, columns: newColumns };
            }
            return section;
        });
        onLayoutChange(newLayout);
    }, [layout, onLayoutChange]);
    
    const handleWidgetSelect = (widgetData: WidgetData) => {
        if (!widgetManifest) return;
        onWidgetSelect(widgetData.id);
        const widgetDefinition = widgetManifest.widgets.find((w: any) => w.id === widgetData.componentType);
        EventBus.getInstance().publish('ui-widget:selected', { widgetId: widgetData.id, widgetDefinition });
    };

    const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const zoomFactor = 1.1;
            const newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
            setZoom(Math.max(0.2, Math.min(newZoom, 5)));
        }
    }, [zoom]);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            isPanning.current = true;
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
            if(containerRef.current) containerRef.current.style.cursor = 'grabbing';
        }
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (isPanning.current) {
            const dx = e.clientX - lastPanPoint.current.x;
            const dy = e.clientY - lastPanPoint.current.y;
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
        }
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button === 1) {
            isPanning.current = false;
            if(containerRef.current) containerRef.current.style.cursor = 'default';
        }
    }, []);

    if (isLoading) {
        return <div style={styles.container}><p style={styles.loadingText}>Loading UI Editor...</p></div>;
    }

    return (
        <div 
            ref={containerRef}
            style={styles.container}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'top left' }}>
                {layout.length === 0 ? (
                    <div style={styles.placeholder}>
                        <p>Drag a "Section" from the Library panel to get started.</p>
                    </div>
                ) : (
                    <div style={styles.canvas}>
                        {layout.map(sectionData => (
                            <Section
                                key={sectionData.id}
                                sectionData={sectionData}
                                onWidgetDrop={handleWidgetDrop}
                                onLayoutChange={handleLayoutChange}
                                selectedWidgetId={selectedWidgetId}
                                onWidgetSelect={handleWidgetSelect}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#2d2d2d',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
    },
    loadingText: {
        color: '#999',
        textAlign: 'center',
        paddingTop: '2rem',
    },
    canvas: {
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0', // Removed gap to allow spacer to control it
        minWidth: '100%',
        minHeight: '100%',
        boxSizing: 'border-box'
    },
    placeholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 150px)', // Adjust based on toolbar/header height
        color: '#666',
        border: '2px dashed #444',
        margin: '1rem',
        borderRadius: '8px',
        textAlign: 'center'
    },
};

export default UIEditorPanel;