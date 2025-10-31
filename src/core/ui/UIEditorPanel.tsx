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
    widgets: (WidgetData | SectionData)[];
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
    const [sectionContextMenu, setSectionContextMenu] = useState<{ x: number; y: number; sectionId: string } | null>(null);
    const [widgetContextMenu, setWidgetContextMenu] = useState<{ x: number; y: number; widgetId: string } | null>(null);
    const [pickerState, setPickerState] = useState<{ anchorEl: HTMLElement, onSelect: (widgetType: string) => void } | null>(null);
    const [showTopDropIndicator, setShowTopDropIndicator] = useState(false);

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

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedType = e.dataTransfer.getData('text/plain');

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

        if (showTopDropIndicator && droppedType === 'layout-section') {
            onLayoutChange([newSection, ...layout]);
        } else if (layout.length === 0 && droppedType === 'layout-section') {
             onLayoutChange([newSection]);
        }
        
        setShowTopDropIndicator(false);
    }, [layout, onLayoutChange, showTopDropIndicator]);
    
    const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isSectionDrag = e.dataTransfer.types.includes('text/plain') && e.dataTransfer.getData('text/plain') === 'layout-section';
    
        if (isSectionDrag && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const topDropZoneHeight = 40;
            if (e.clientY < rect.top + topDropZoneHeight) {
                setShowTopDropIndicator(true);
            } else {
                setShowTopDropIndicator(false);
            }
        }
    }, []);
    
    const handleCanvasDragLeave = useCallback(() => {
        setShowTopDropIndicator(false);
    }, []);

    const handleWidgetDrop = useCallback((sectionId: string, columnIndex: number, droppedType: string, dropIndex: number) => {
        if (!widgetManifest) return;
    
        let newItem: WidgetData | SectionData;
    
        if (droppedType === 'layout-section') {
            newItem = {
                id: crypto.randomUUID(),
                columnLayout: 1,
                columns: [{ id: crypto.randomUUID(), widgets: [], styles: { backgroundColor: 'transparent', padding: '0px', rowGap: 8 } }],
                padding: '16px',
                margin: '0',
                backgroundColor: 'rgba(0,0,0,0.1)',
                height: 'auto',
                minHeight: '100px',
                alignItems: 'flex-start',
            };
        } else if (componentRegistry[droppedType]) {
            const widgetDef = widgetManifest.widgets.find((w: any) => w.id === droppedType);
            const defaultProps = widgetDef?.properties.reduce((acc: any, prop: any) => {
                acc[prop.name] = prop.defaultValue;
                return acc;
            }, {} as Record<string, any>) || {};
    
            const defaultStyles: Record<string, any> = {};
            if (widgetDef?.styles) {
                Object.entries(widgetDef.styles).forEach(([groupName, props]: [string, any]) => {
                    defaultStyles[groupName] = props.reduce((acc: any, prop: any) => {
                        acc[prop.name] = prop.defaultValue;
                        return acc;
                    }, {});
                });
            }
    
            newItem = {
                id: crypto.randomUUID(),
                componentType: droppedType,
                props: defaultProps,
                styles: defaultStyles
            };
        } else {
            return; // Dropped type is not a valid widget or section
        }
    
        const newLayout = JSON.parse(JSON.stringify(layout)); // Deep copy for safe mutation
    
        function findAndInsert(sections: SectionData[]): boolean {
            for (const section of sections) {
                if (section.id === sectionId) {
                    const column = section.columns[columnIndex];
                    if (column) {
                        column.widgets.splice(dropIndex, 0, newItem);
                        return true;
                    }
                }
                // Recurse
                for (const col of section.columns) {
                    if (findAndInsert(col.widgets.filter(w => !('componentType' in w)) as SectionData[])) {
                        return true;
                    }
                }
            }
            return false;
        }
    
        findAndInsert(newLayout);
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

    const handleSectionContextMenuRequest = (e: React.MouseEvent, sectionId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSectionContextMenu({ x: e.clientX, y: e.clientY, sectionId });
    };

    const handleWidgetContextMenuRequest = useCallback((e: React.MouseEvent, widgetId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setWidgetContextMenu({ x: e.clientX, y: e.clientY, widgetId });
    }, []);


    const handleCloseContextMenu = () => {
        setSectionContextMenu(null);
        setWidgetContextMenu(null);
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

    const sectionContextMenuItems = sectionContextMenu ? [
        { label: 'Duplicate Section', onClick: () => onDuplicateSection(sectionContextMenu.sectionId) },
        { label: 'Delete Section', onClick: () => handleDeleteSection(sectionContextMenu.sectionId) },
    ] : [];

    const widgetContextMenuItems = widgetContextMenu ? [
        { label: 'Delete Widget', onClick: () => {
            if (window.confirm('Are you sure you want to delete this widget?')) {
                EventBus.getInstance().publish('ui-widget:delete', { widgetId: widgetContextMenu.widgetId });
            }
        }},
    ] : [];

    if (isLoading) {
        return <div style={styles.container}><p style={styles.loadingText}>Loading UI Editor...</p></div>;
    }

    return (
        <div 
            ref={containerRef}
            style={styles.container}
            onDragOver={handleCanvasDragOver}
            onDrop={handleDrop}
            onDragLeave={handleCanvasDragLeave}
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => {
                handleCloseContextMenu();
                setPickerState(null);
            }}
        >
            {showTopDropIndicator && <div style={styles.topDropIndicator}>Add Section Here</div>}
            {layout.length === 0 ? (
                <div style={styles.placeholder}>
                    <p>Drag a "Section" from the Library panel to get started.</p>
                </div>
            ) : (
                <div 
                    style={styles.canvas}
                >
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
                            onContextMenuRequest={handleSectionContextMenuRequest}
                            onColumnCountChange={onSectionColumnCountChange}
                            onAddWidgetClick={handleOpenPicker}
                            isNested={false}
                            onWidgetContextMenuRequest={handleWidgetContextMenuRequest}
                        />
                    ))}
                </div>
            )}
            {sectionContextMenu && (
                <ContextMenu
                    x={sectionContextMenu.x}
                    y={sectionContextMenu.y}
                    items={sectionContextMenuItems}
                    onClose={handleCloseContextMenu}
                />
            )}
            {widgetContextMenu && (
                <ContextMenu
                    x={widgetContextMenu.x}
                    y={widgetContextMenu.y}
                    items={widgetContextMenuItems}
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
        paddingTop: '20px', // Space for top drop zone
        position: 'relative',
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
    topDropIndicator: {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '40px',
        backgroundColor: 'rgba(0, 170, 255, 0.2)',
        border: '2px dashed #00aaff',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00aaff',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    },
};

export default UIEditorPanel;