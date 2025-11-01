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
        height?: string;
        minHeight?: string;
        alignItems?: string;
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
    maxHeight?: string;
    alignItems?: string;
    columnWidths?: number[];
}

interface UIEditorPanelProps {
    layout: SectionData[];
    onLayoutChange: (newLayout: SectionData[]) => void;
    widgetManifest: any;
    onDuplicateSection: (sectionId: string) => void;
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
    widgetManifest,
    onDuplicateSection,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [sectionContextMenu, setSectionContextMenu] = useState<{ x: number; y: number; sectionId: string } | null>(null);
    const [widgetContextMenu, setWidgetContextMenu] = useState<{ x: number; y: number; widgetId: string } | null>(null);
    const [pickerState, setPickerState] = useState<{ anchorEl: HTMLElement, onSelect: (widgetType: string) => void } | null>(null);
    const [showTopDropIndicator, setShowTopDropIndicator] = useState(false);
    const [isCanvasHovered, setIsCanvasHovered] = useState(false);

    const handleAddSection = useCallback((position: 'start' | 'end') => {
        const newSection: SectionData = {
            id: crypto.randomUUID(),
            columnLayout: 1,
            columns: [{ id: crypto.randomUUID(), widgets: [], styles: { backgroundColor: 'transparent', padding: '0px', rowGap: 0 } }],
            padding: '0px',
            margin: '0',
            height: 'auto',
            minHeight: '100px',
            alignItems: 'flex-start',
        };
    
        if (position === 'start') {
            onLayoutChange([newSection, ...layout]);
        } else {
            onLayoutChange([...layout, newSection]);
        }
    }, [layout, onLayoutChange]);

    const handleSectionAdd = useCallback((targetId: string, position: 'before' | 'after') => {
        const newSection: SectionData = {
            id: crypto.randomUUID(),
            columnLayout: 1,
            columns: [{ id: crypto.randomUUID(), widgets: [], styles: { backgroundColor: 'transparent', padding: '0px', rowGap: 0 } }],
            padding: '0px',
            margin: '0',
            height: 'auto',
            minHeight: '100px',
            alignItems: 'flex-start',
        };
    
        const newLayout = [...layout];
        const targetIndex = newLayout.findIndex(s => s.id === targetId);
        if (targetIndex !== -1) {
            const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
            newLayout.splice(insertIndex, 0, newSection);
            onLayoutChange(newLayout);
        }
    }, [layout, onLayoutChange]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedType = e.dataTransfer.getData('text/plain');

        if (droppedType !== 'layout-section') return;

        const newSection: SectionData = {
            id: crypto.randomUUID(),
            columnLayout: 1,
            columns: [{ id: crypto.randomUUID(), widgets: [], styles: { backgroundColor: 'transparent', padding: '0px', rowGap: 0 } }],
            padding: '0px',
            margin: '0',
            height: 'auto',
            minHeight: '100px',
            alignItems: 'flex-start',
        };

        if (showTopDropIndicator) {
            onLayoutChange([newSection, ...layout]);
        } else {
            onLayoutChange([...layout, newSection]);
        }
        
        setShowTopDropIndicator(false);
    }, [layout, onLayoutChange, showTopDropIndicator, widgetManifest]);
    
    const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isSectionDrag = e.dataTransfer.types.includes('text/plain') && e.dataTransfer.getData('text/plain') === 'layout-section';
    
        if (isSectionDrag && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const topDropZoneHeight = 40;
            if (e.clientY < rect.top + topDropZoneHeight && layout.length > 0) {
                setShowTopDropIndicator(true);
            } else {
                setShowTopDropIndicator(false);
            }
        }
    }, [layout.length]);
    
    const handleCanvasDragLeave = useCallback(() => {
        setShowTopDropIndicator(false);
    }, []);

    const handleWidgetDrop = useCallback((sectionId: string, columnIndex: number, droppedType: string, dropIndex: number) => {
        if (!widgetManifest) return;

        if (widgetManifest.widgets.some((w: any) => w.id === droppedType && w.category === 'Windows')) {
            EventBus.getInstance().publish('window:create-design', { id: droppedType });
            return;
        }
    
        let newItem: WidgetData | SectionData;
    
        if (droppedType === 'layout-section') {
            newItem = {
                id: crypto.randomUUID(),
                columnLayout: 1,
                columns: [{ id: crypto.randomUUID(), widgets: [], styles: { backgroundColor: 'transparent', padding: '0px', rowGap: 0 } }],
                padding: '0px',
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

    const handleWidgetSelect = (widgetData: WidgetData, columnId: string, sectionId: string) => {
        if (!widgetManifest) return;
        const widgetDefinition = widgetManifest.widgets.find((w: any) => w.id === widgetData.componentType);
        EventBus.getInstance().publish('ui-element:selected', { type: 'widget', data: { widgetData, widgetDefinition, columnId, sectionId } });
    };

    const handleSectionSelect = (sectionId: string | null) => {
         if (sectionId) {
            const findRecursively = (items: (SectionData | WidgetData)[]): SectionData | null => {
                for (const item of items) {
                    if (!('componentType' in item)) { // It's a SectionData
                        if (item.id === sectionId) return item;
                        for (const col of item.columns) {
                            const found = findRecursively(col.widgets);
                            if (found) return found;
                        }
                    }
                }
                return null;
            }
            const sectionData = findRecursively(layout);
            if (sectionData) EventBus.getInstance().publish('ui-element:selected', { type: 'section', data: sectionData });

        } else {
            EventBus.getInstance().publish('ui-element:deselected');
        }
    };
    
    const handleColumnSelect = (columnId: string | null) => {
        if (columnId) {
             const findRecursively = (items: (SectionData | WidgetData)[]): ColumnData | null => {
                for (const item of items) {
                    if (!('componentType' in item)) {
                        for (const col of item.columns) {
                            if (col.id === columnId) return col;
                            const found = findRecursively(col.widgets);
                            if (found) return found;
                        }
                    }
                }
                return null;
            }
            const columnData = findRecursively(layout);
            if(columnData) EventBus.getInstance().publish('ui-element:selected', { type: 'column', data: columnData });
        } else {
             EventBus.getInstance().publish('ui-element:deselected');
        }
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
        handleSectionSelect(null);
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
    
    const uiWidgets = widgetManifest ? {
        ...widgetManifest,
        widgets: widgetManifest.widgets.filter((w: any) => w.category !== 'Windows')
    } : null;


    if (!widgetManifest) {
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
                EventBus.getInstance().publish('ui-element:deselected');
            }}
        >
            {showTopDropIndicator && <div style={styles.topDropIndicator}>Add Section Here</div>}
            {layout.length === 0 ? (
                <div style={styles.placeholder} onClick={(e) => { e.stopPropagation(); handleAddSection('start'); }}>
                    <div style={styles.addFirstSectionButton}>
                        <span style={styles.addIcon}>+</span> Add Section
                    </div>
                </div>
            ) : (
                <div 
                    style={styles.canvas}
                    onMouseEnter={() => setIsCanvasHovered(true)}
                    onMouseLeave={() => setIsCanvasHovered(false)}
                >
                    <div style={{...styles.sectionInserter, opacity: isCanvasHovered ? 1 : 0}}>
                        <button style={styles.inserterButton} onClick={(e) => { e.stopPropagation(); handleAddSection('start'); }} title="Add section at the top">
                            +
                        </button>
                    </div>
                    {layout.map(sectionData => (
                        <Section
                            key={sectionData.id}
                            sectionData={sectionData}
                            onWidgetDrop={handleWidgetDrop}
                            onWidgetSelect={handleWidgetSelect}
                            onSectionDrop={handleSectionReorder}
                            onWidgetMove={handleWidgetMove}
                            onSectionSelect={handleSectionSelect}
                            onColumnSelect={handleColumnSelect}
                            onContextMenuRequest={handleSectionContextMenuRequest}
                            onAddWidgetClick={handleOpenPicker}
                            isNested={false}
                            onWidgetContextMenuRequest={handleWidgetContextMenuRequest}
                            onSectionAdd={handleSectionAdd}
                        />
                    ))}
                    <div style={{...styles.sectionInserter, opacity: isCanvasHovered ? 1 : 0}}>
                         <button style={styles.inserterButton} onClick={(e) => { e.stopPropagation(); handleAddSection('end'); }} title="Add section at the bottom">
                            +
                        </button>
                    </div>
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
            {pickerState && uiWidgets && (
                <WidgetPicker
                    widgetManifest={uiWidgets}
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
        position: 'relative',
    },
    placeholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100%',
        backgroundColor: '#2d2d2d',
        cursor: 'pointer',
    },
    addFirstSectionButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '1.2rem',
        color: '#ccc',
        padding: '1rem 2rem',
        border: '2px dashed #555',
        borderRadius: '8px',
        transition: 'background-color 0.2s, border-color 0.2s',
    },
    addIcon: {
        fontSize: '2rem',
        lineHeight: 1,
    },
    sectionInserter: {
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s ease-in-out',
        pointerEvents: 'none',
        position: 'relative',
        margin: '4px 0',
    },
    inserterButton: {
        backgroundColor: 'rgba(0, 122, 204, 0.7)',
        border: '1px solid #00aaff',
        color: 'white',
        cursor: 'pointer',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        lineHeight: '32px',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
        pointerEvents: 'all',
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