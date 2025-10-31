import React, { useCallback, useRef, useEffect, useState } from 'react';
import TaskListWidget from './widgets/TaskListWidget';
import CreateTaskFormWidget from './widgets/CreateTaskFormWidget';
import HeadingWidget from './widgets/HeadingWidget';
import Section from './layout/Section';
import { EventBus } from '../ecs/EventBus';
import SpacerWidget from './widgets/SpacerWidget';
import ImageWidget from './widgets/ImageWidget';
import ContextMenu from './ContextMenu';
import WidgetPicker from './WidgetPicker';

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
    height?: string;
    minHeight?: string;
    alignItems?: string;
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
    onDuplicateSection: (sectionId: string) => void;
    onSectionColumnCountChange: (sectionId: string, count: number) => void;
}

// A map to resolve component names from the manifest to actual React components
export const componentRegistry: Record<string, React.ComponentType<any>> = {
    'task-list': TaskListWidget,
    'create-task-form': CreateTaskFormWidget,
    'heading': HeadingWidget,
    'spacer': SpacerWidget,
    'image': ImageWidget,
};

const UIEditorPanel: React.FC<UIEditorPanelProps> = ({ 
    layout, 
    onLayoutChange, 
    selectedWidgetId, 
    onWidgetSelect, 
    selectedSectionId, 
    onSectionSelect, 
    selectedColumnId, 
    onColumnSelect,
    onDuplicateSection,
    onSectionColumnCountChange
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [widgetManifest, setWidgetManifest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; sectionId: string } | null>(null);
    const [pickerState, setPickerState] = useState<{ anchorEl: HTMLElement, onSelect: (widgetType: string) => void } | null>(null);

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
        e.stopPropagation(); // Stop propagation to prevent section drop handlers from firing
        const droppedType = e.dataTransfer.getData('text/plain');
        
        if (droppedType === 'layout-section') {
            const newSection: SectionData = {
                id: crypto.randomUUID(),
                columnLayout: 1,
                columns: [{ id: crypto.randomUUID(), widgets: [], styles: { backgroundColor: 'transparent', padding: '0px', rowGap: 8 } }],
                padding: '16px',
                margin: '0',
                height: 'auto',
                minHeight: '100px',
                alignItems: 'flex-start',
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

    const handleWidgetDrop = useCallback((sectionId: string, columnIndex: number, widgetType: string, dropIndex: number) => {
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
                        const newWidgets = [...col.widgets];
                        newWidgets.splice(dropIndex, 0, newWidget); // Use splice to insert at drop index
                        return { ...col, widgets: newWidgets };
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

    const handleWidgetSelect = (widgetData: WidgetData) => {
        if (!widgetManifest) return;
        onWidgetSelect(widgetData.id);
        const widgetDefinition = widgetManifest.widgets.find((w: any) => w.id === widgetData.componentType);
        EventBus.getInstance().publish('ui-widget:selected', { widgetId: widgetData.id, widgetDefinition });
    };

    const handleContextMenuRequest = (e: React.MouseEvent, sectionId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, sectionId });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleDeleteSection = (sectionId: string) => {
        onLayoutChange(layout.filter(s => s.id !== sectionId));
        onSectionSelect(null); // Deselect if it was selected
    };
    
    const handleOpenPicker = (sectionId: string, columnIndex: number, insertIndex: number, anchorEl: HTMLElement) => {
        const onSelect = (widgetType: string) => {
            handleWidgetDrop(sectionId, columnIndex, widgetType, insertIndex);
            setPickerState(null);
        };
        setPickerState({ anchorEl, onSelect });
    };

    const contextMenuItems = contextMenu ? [
        { label: 'Duplicate Section', onClick: () => onDuplicateSection(contextMenu.sectionId) },
        { label: 'Delete Section', onClick: () => handleDeleteSection(contextMenu.sectionId) },
    ] : [];

    if (isLoading) {
        return <div style={styles.container}><p style={styles.loadingText}>Loading UI Editor...</p></div>;
    }

    return (
        <div 
            ref={containerRef}
            style={styles.container}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => {
                handleCloseContextMenu();
                setPickerState(null);
            }}
        >
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
                            selectedWidgetId={selectedWidgetId}
                            onWidgetSelect={handleWidgetSelect}
                            onSectionDrop={handleSectionReorder}
                            onWidgetMove={handleWidgetMove}
                            isSectionSelected={sectionData.id === selectedSectionId}
                            onSectionSelect={onSectionSelect}
                            selectedColumnId={selectedColumnId}
                            onColumnSelect={onColumnSelect}
                            onContextMenuRequest={handleContextMenuRequest}
                            onColumnCountChange={onSectionColumnCountChange}
                            onAddWidgetClick={handleOpenPicker}
                        />
                    ))}
                </div>
            )}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    items={contextMenuItems}
                    onClose={handleCloseContextMenu}
                />
            )}
            {pickerState && widgetManifest && (
                <WidgetPicker
                    widgetManifest={widgetManifest}
                    anchorEl={pickerState.anchorEl}
                    onSelect={pickerState.onSelect}
                    onClose={() => setPickerState(null)}
                />
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#1e1e1e',
        position: 'relative',
        padding: '0',
        boxSizing: 'border-box',
        overflowY: 'auto',
    },
    loadingText: {
        color: '#999',
        textAlign: 'center',
        paddingTop: '2rem',
    },
    canvas: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: '#2d2d2d',
        boxSizing: 'border-box',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    },
    placeholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100%',
        color: '#666',
        border: '2px dashed #444',
        textAlign: 'center',
        backgroundColor: '#2d2d2d',
        borderRadius: '8px',
    },
};

export default UIEditorPanel;