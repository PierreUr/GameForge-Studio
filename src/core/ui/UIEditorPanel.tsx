import React, { useCallback, useRef, useEffect, useState } from 'react';
import TaskListWidget from './widgets/TaskListWidget';
import CreateTaskFormWidget from './widgets/CreateTaskFormWidget';
import HeadingWidget from './widgets/HeadingWidget';
import Section from './layout/Section';
import { EventBus } from '../ecs/EventBus';
import SpacerWidget from './widgets/SpacerWidget';
import ImageWidget from './widgets/ImageWidget';

// --- DATA TYPES for the new Layout System ---
export interface WidgetData {
    id: string;
    componentType: string;
    props: Record<string, any>;
    styles?: Record<string, any>;
}
export interface ColumnData {
    id: string;
    widgets: WidgetData[];
    styles?: {
        backgroundColor?: string;
        padding?: string;
        rowGap?: number;
    };
}
export interface SectionData {
    id: string;
    columnLayout: number;
    columns: ColumnData[];
    isSpacer?: boolean;
    columnGap?: number;
    padding?: string;
    margin?: string;
    backgroundColor?: string;
}

interface UIEditorPanelProps {
    layout: SectionData[];
    onLayoutChange: (newLayout: SectionData[]) => void;
    selectedWidgetId: string | null;
    onWidgetSelect: (widgetId: string | null) => void;
    selectedSectionId: string | null;
    onSectionSelect: (sectionId: string | null) => void;
    selectedColumnId: string | null;
    onColumnSelect: (columnId: string | null) => void;
}

// A map to resolve component names from the manifest to actual React components
export const componentRegistry: Record<string, React.ComponentType<any>> = {
    'task-list': TaskListWidget,
    'create-task-form': CreateTaskFormWidget,
    'heading': HeadingWidget,
    'spacer': SpacerWidget,
    'image': ImageWidget,
};

const UIEditorPanel: React.FC<UIEditorPanelProps> = ({ layout, onLayoutChange, selectedWidgetId, onWidgetSelect, selectedSectionId, onSectionSelect, selectedColumnId, onColumnSelect }) => {
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
    
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            if (e.ctrlKey) {
                // Zooming logic
                const rect = container.getBoundingClientRect();
                const pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                
                const oldScale = zoom;
                const zoomFactor = 1.1;
                const newScale = e.deltaY < 0 ? oldScale * zoomFactor : oldScale / zoomFactor;
                const clampedNewScale = Math.max(0.2, Math.min(newScale, 5));

                // Position of the pointer relative to the content before zoom
                const worldX = (pointer.x - pan.x) / oldScale;
                const worldY = (pointer.y - pan.y) / oldScale;

                // New pan position to keep the world point under the cursor
                const newPanX = pointer.x - worldX * clampedNewScale;
                const newPanY = pointer.y - worldY * clampedNewScale;

                setZoom(clampedNewScale);
                setPan({ x: newPanX, y: newPanY });
            } else {
                // Scrolling (panning) logic
                setPan(prevPan => ({
                    x: prevPan.x - e.deltaX,
                    y: prevPan.y - e.deltaY
                }));
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [zoom, pan]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation(); // Stop propagation to prevent section drop handlers from firing
        const droppedType = e.dataTransfer.getData('text/plain');
        
        if (droppedType === 'layout-section') {
            const newSection: SectionData = {
                id: crypto.randomUUID(),
                columnLayout: 1,
                columns: [{ id: crypto.randomUUID(), widgets: [], styles: { backgroundColor: 'transparent', padding: '0px', rowGap: 8 } }],
                margin: '0 0 16px 0',
            };
            onLayoutChange([...layout, newSection]);
        } else if (droppedType === 'spacer') {
            const spacerWidgetDef = widgetManifest.widgets.find((w: any) => w.id === 'spacer');
            const newSpacerWidget: WidgetData = {
                id: crypto.randomUUID(),
                componentType: 'spacer',
                props: { height: spacerWidgetDef?.properties?.[0]?.defaultValue || 20 },
                styles: {}
            };
             const newSection: SectionData = {
                id: crypto.randomUUID(),
                columnLayout: 1,
                columns: [{ id: crypto.randomUUID(), widgets: [newSpacerWidget] }],
                isSpacer: true,
            };
            onLayoutChange([...layout, newSection]);
        }

    }, [layout, onLayoutChange, widgetManifest]);

    const handleWidgetDrop = useCallback((sectionId: string, columnIndex: number, widgetType: string) => {
        if (!widgetManifest || widgetType === 'layout-section' || !componentRegistry[widgetType]) return;

        const widgetDef = widgetManifest.widgets.find((w: any) => w.id === widgetType);
        const defaultProps = widgetDef?.properties.reduce((acc: any, prop: any) => {
            acc[prop.name] = prop.defaultValue;
            return acc;
        }, {} as Record<string, any>) || {};

        // Initialize styles from manifest
        const defaultStyles: Record<string, any> = {};
        if (widgetDef?.styles) {
            Object.entries(widgetDef.styles).forEach(([groupName, props]: [string, any]) => {
                defaultStyles[groupName] = props.reduce((acc: any, prop: any) => {
                    acc[prop.name] = prop.defaultValue;
                    return acc;
                }, {});
            });
        }

        const newWidget: WidgetData = {
            id: crypto.randomUUID(),
            componentType: widgetType,
            props: defaultProps,
            styles: defaultStyles
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

    const handleSectionReorder = useCallback((draggedId: string, targetId: string, position: 'before' | 'after') => {
        const newLayout = [...layout];
        const draggedIndex = newLayout.findIndex(s => s.id === draggedId);
        if (draggedIndex === -1) return;

        const [draggedItem] = newLayout.splice(draggedIndex, 1);

        const newTargetIndex = newLayout.findIndex(s => s.id === targetId);
        if (newTargetIndex === -1) {
            onLayoutChange([...newLayout, draggedItem]); // Drop at the end if target is somehow not found
            return;
        }
        
        const insertIndex = position === 'before' ? newTargetIndex : newTargetIndex + 1;
        
        newLayout.splice(insertIndex, 0, draggedItem);
        onLayoutChange(newLayout);
    }, [layout, onLayoutChange]);
    
    const handleWidgetMove = useCallback((sourceInfo: any, targetInfo: any) => {
        EventBus.getInstance().publish('ui-widget:move', {
            source: sourceInfo,
            target: targetInfo
        });
    }, []);

    const handleLayoutChange = useCallback((sectionId: string, newColumnCount: number) => {
        const newLayout = layout.map(section => {
            if (section.id === sectionId) {
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

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button === 1 && containerRef.current) { // Middle mouse button
            e.preventDefault();
            isPanning.current = true;
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
            containerRef.current.style.cursor = 'grabbing';
            containerRef.current.setPointerCapture(e.pointerId);
        }
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (isPanning.current) {
            const dx = e.clientX - lastPanPoint.current.x;
            const dy = e.clientY - lastPanPoint.current.y;
            setPan(prevPan => ({
                x: prevPan.x + dx,
                y: prevPan.y + dy
            }));
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
        }
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button === 1 && containerRef.current) {
            isPanning.current = false;
            containerRef.current.style.cursor = 'default';
            containerRef.current.releasePointerCapture(e.pointerId);
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
                                onSectionDrop={handleSectionReorder}
                                onWidgetMove={handleWidgetMove}
                                isSectionSelected={sectionData.id === selectedSectionId}
                                onSectionSelect={onSectionSelect}
                                selectedColumnId={selectedColumnId}
                                onColumnSelect={onColumnSelect}
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
        overflow: 'hidden', // This is correct for manual panning
        cursor: 'default',
    },
    loadingText: {
        color: '#999',
        textAlign: 'center',
        paddingTop: '2rem',
    },
    canvas: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: '100%',
        boxSizing: 'border-box',
    },
    placeholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 100px)',
        color: '#666',
        border: '2px dashed #444',
        textAlign: 'center',
        margin: '0',
        width: '100%',
        borderRadius: '0',
    },
};

export default UIEditorPanel;