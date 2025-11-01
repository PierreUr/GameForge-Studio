import React, { useState, useRef, useEffect } from 'react';
import { WidgetData, componentRegistry, ColumnData, SectionData } from '../UIEditorPanel';
import Section from './Section';
import { EventBus } from '../../ecs/EventBus';

interface ColumnProps {
    columnData: ColumnData;
    sectionId: string;
    columnIndex: number;
    onDrop: (widgetType: string, dropIndex: number) => void;
    onWidgetSelect: (widgetData: WidgetData, columnId: string, sectionId: string) => void;
    onWidgetMove: (source: any, target: any) => void;
    onSelect: (columnId: string | null) => void;
    onAddWidgetClick: (sectionId: string, columnIndex: number, insertIndex: number, anchorEl: HTMLElement) => void;
    onWidgetContextMenuRequest: (e: React.MouseEvent, widgetId: string) => void;
    // Props for recursive sections
    onWidgetDrop: (sectionId: string, columnIndex: number, widgetType: string, dropIndex: number) => void;
    onSectionDrop: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
    onSectionSelect: (sectionId: string | null) => void;
    onColumnSelect: (columnId: string | null) => void;
    onContextMenuRequest: (e: React.MouseEvent, sectionId: string) => void;
    onSectionAdd: (targetId: string, position: 'before' | 'after') => void;
    isNested?: boolean;
}

const WIDGET_DRAG_TYPE = 'application/gameforge-widget';
const SECTION_DRAG_TYPE = 'application/gameforge-section-id';

const Column: React.FC<ColumnProps> = (props) => {
    const { 
        columnData, 
        sectionId, 
        columnIndex, 
        onDrop, 
        onWidgetSelect, 
        onWidgetMove,
        onSelect,
        onAddWidgetClick,
        onWidgetContextMenuRequest,
    } = props;
    const { id: columnId, widgets } = columnData;
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
    const columnRef = useRef<HTMLDivElement>(null);
    const [isSmall, setIsSmall] = useState(false);

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const threshold = 140; // Width in pixels to switch to icon
                setIsSmall(entry.contentRect.width < threshold);
            }
        });

        const currentColumn = columnRef.current;
        if (currentColumn) {
            observer.observe(currentColumn);
        }

        return () => {
            if (currentColumn) {
                observer.unobserve(currentColumn);
            }
        };
    }, []);

    useEffect(() => {
        const handleSelection = (payload: {type: string, data: any}) => {
             if (payload.type === 'column' && payload.data.id === columnId) {
                setIsSelected(true);
                setSelectedWidgetId(null);
            } else if (payload.type === 'widget' && payload.data.columnId === columnId) {
                setSelectedWidgetId(payload.data.widgetData.id);
                setIsSelected(false);
            } else {
                setIsSelected(false);
                setSelectedWidgetId(null);
            }
        };
        const handleDeselection = () => {
            setIsSelected(false);
            setSelectedWidgetId(null);
        };

        EventBus.getInstance().subscribe('ui-element:selected', handleSelection);
        EventBus.getInstance().subscribe('ui-element:deselected', handleDeselection);
        return () => {
            EventBus.getInstance().unsubscribe('ui-element:selected', handleSelection);
            EventBus.getInstance().unsubscribe('ui-element:deselected', handleDeselection);
        }
    }, [columnId]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        const isSectionDrag = e.dataTransfer.types.includes(SECTION_DRAG_TYPE);
        const isWidgetDrag = e.dataTransfer.types.includes(WIDGET_DRAG_TYPE);
        const isLibraryDrag = e.dataTransfer.types.includes('text/plain');

        if (isSectionDrag && !isLibraryDrag) { // Don't handle internal section reordering
            setDropIndex(null);
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();

        if (isWidgetDrag || isLibraryDrag) {
            e.dataTransfer.dropEffect = isWidgetDrag ? 'move' : 'copy';
            
            const children = Array.from((e.currentTarget as HTMLDivElement).children).filter(el => el.getAttribute('data-widget-index'));
            let newDropIndex = children.length;

            for (let i = 0; i < children.length; i++) {
                const childRect = children[i].getBoundingClientRect();
                const midY = childRect.top + childRect.height / 2;
                if (e.clientY < midY) {
                    newDropIndex = i;
                    break;
                }
            }
            setDropIndex(newDropIndex);
        }
    };

    const handleDragLeave = () => {
        setDropIndex(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (e.dataTransfer.types.includes(SECTION_DRAG_TYPE) && !e.dataTransfer.types.includes('text/plain')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        
        const widgetPayload = e.dataTransfer.getData(WIDGET_DRAG_TYPE);

        if (widgetPayload) {
            try {
                const sourceInfo = JSON.parse(widgetPayload);
                if (dropIndex !== null) {
                    onWidgetMove(sourceInfo, {
                        targetSectionId: sectionId,
                        targetColumnIndex: columnIndex,
                        targetDropIndex: dropIndex
                    });
                }
            } catch (err) {
                console.error("Failed to parse widget drag data", err);
            }
        } else {
            const droppedType = e.dataTransfer.getData('text/plain');
            if (dropIndex !== null) {
                onDrop(droppedType, dropIndex);
            }
        }
        
        setDropIndex(null);
    };

    const handleWidgetDragStart = (e: React.DragEvent<HTMLDivElement>, item: WidgetData | SectionData) => {
        e.stopPropagation();
        const payload = JSON.stringify({ 
            widgetId: item.id, // widgetId is generic for any item with an ID
            sourceSectionId: sectionId,
            sourceColumnIndex: columnIndex,
        });
        e.dataTransfer.setData(WIDGET_DRAG_TYPE, payload);
        e.dataTransfer.effectAllowed = 'move';
    };

    const getCombinedStyles = (widget: WidgetData): React.CSSProperties => {
        if (!widget.styles) return {};
        // Flattens all style groups (typography, spacing, etc.) into a single style object.
        return Object.values(widget.styles).reduce((acc, group) => ({ ...acc, ...group }), {});
    };

    const handleColumnClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            e.stopPropagation();
            onSelect(columnId);
        }
    };

    const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>, insertIndex: number) => {
        e.stopPropagation();
        onAddWidgetClick(sectionId, columnIndex, insertIndex, e.currentTarget);
    };

    const columnStyle: React.CSSProperties = {
        ...styles.column,
        border: isSelected ? '2px solid #28a745' : '1px dashed #555',
        backgroundColor: columnData.styles?.backgroundColor || 'transparent',
        padding: columnData.styles?.padding || '0px',
        gap: `${columnData.styles?.rowGap || 0}px`,
        height: columnData.styles?.height || 'auto',
        minHeight: columnData.styles?.minHeight, // Let it stretch by default
        alignItems: columnData.styles?.alignItems,
        zIndex: 2,
    };
    
    const addButtonContainerStyle = isHovered 
        ? {...styles.addButtonContainer, ...styles.addButtonContainerHover} 
        : styles.addButtonContainer;

    return (
        <div 
            ref={columnRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onClick={handleColumnClick}
            style={columnStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {widgets.length === 0 && dropIndex === null && (
                isSmall ? (
                    <button
                        onClick={(e) => handleAddClick(e, 0)}
                        style={styles.placeholderAddButtonIcon}
                    >
                        +
                    </button>
                ) : (
                    <div style={styles.emptyColumnPlaceholder}>
                        <span>Drop Widget Here or </span>
                        <button 
                            onClick={(e) => handleAddClick(e, 0)} 
                            style={styles.placeholderAddButton}
                        >
                            Add Widget
                        </button>
                    </div>
                )
            )}
            {widgets.map((item, index) => {
                const isWidget = 'componentType' in item;

                return (
                    <React.Fragment key={item.id}>
                        {dropIndex === index && <div style={styles.dropIndicator} />}
                        
                        {isWidget ? (
                             <div
                                data-widget-index={index}
                                draggable
                                onDragStart={(e) => handleWidgetDragStart(e, item)}
                                onClick={(e) => { e.stopPropagation(); onWidgetSelect(item, columnId, sectionId); }}
                                onContextMenu={(e) => onWidgetContextMenuRequest(e, item.id)}
                                style={{
                                    ...styles.widgetWrapper,
                                    outline: selectedWidgetId === item.id ? '2px solid #007acc' : '1px solid transparent',
                                    outlineOffset: '2px',
                                    ...getCombinedStyles(item)
                                }}
                            >
                                {React.createElement(componentRegistry[item.componentType], { ...item.props, styles: item.styles })}
                             </div>
                        ) : (
                            <div data-widget-index={index} style={{ margin: 0, padding: 0, width: '100%' }}>
                                 <Section 
                                    {...props}
                                    sectionData={item as SectionData} 
                                    isNested={true}
                                    onCustomDragStart={(e) => handleWidgetDragStart(e, item)}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
            {dropIndex === widgets.length && <div style={styles.dropIndicator} />}

             {widgets.length > 0 && (
                 <div style={addButtonContainerStyle}>
                     <button onClick={(e) => handleAddClick(e, widgets.length)} style={styles.addButton} title="Add Widget">
                         +
                     </button>
                 </div>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    column: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '4px',
        transition: 'border-color 0.2s, background-color 0.2s',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: 0, // CRITICAL FIX: Allows column to shrink and respect parent's height/maxHeight constraints.
    },
    emptyColumnPlaceholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#777',
        fontSize: '0.9rem',
        minHeight: '60px',
        pointerEvents: 'none',
        flex: 1,
        flexWrap: 'wrap',
        gap: '0.5rem',
        padding: '1rem',
    },
    placeholderAddButton: {
        pointerEvents: 'all',
        background: 'none',
        border: '1px solid #666',
        color: '#aaa',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '0.8rem',
    },
    placeholderAddButtonIcon: {
        width: '100%',
        height: '100%',
        minHeight: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'none',
        border: 'none',
        color: '#777',
        fontSize: '2.5rem',
        cursor: 'pointer',
        padding: 0,
        borderRadius: '4px',
        transition: 'color 0.2s',
    },
    widgetWrapper: {
        position: 'relative',
        cursor: 'pointer',
        borderRadius: '4px',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        width: '100%',
        minHeight: 0, // Fix for flexbox shrinking issues with content like images
    },
    dropIndicator: {
        height: '4px',
        backgroundColor: '#00aaff',
        borderRadius: '2px',
        margin: '2px 0',
    },
    addButtonContainer: {
        position: 'absolute',
        bottom: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s ease-in-out',
        opacity: 0,
        pointerEvents: 'none',
    },
    addButtonContainerHover: {
        opacity: 1,
        pointerEvents: 'all',
    },
    addButton: {
        backgroundColor: 'rgba(40, 167, 69, 0.7)',
        border: '1px solid #28a745',
        color: 'white',
        cursor: 'pointer',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        lineHeight: '24px',
        fontWeight: 'bold',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    },
};

export default Column;