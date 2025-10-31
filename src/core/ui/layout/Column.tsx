import React, { useState, useRef } from 'react';
import { WidgetData, componentRegistry, ColumnData, SectionData } from '../UIEditorPanel';
import Section from './Section';

interface ColumnProps {
    columnData: ColumnData;
    sectionId: string;
    columnIndex: number;
    onDrop: (widgetType: string, dropIndex: number) => void;
    selectedWidgetId: string | null;
    onWidgetSelect: (widgetData: WidgetData) => void;
    onWidgetMove: (source: any, target: any) => void;
    isSelected: boolean;
    onSelect: (columnId: string | null) => void;
    onAddWidgetClick: (sectionId: string, columnIndex: number, insertIndex: number, anchorEl: HTMLElement) => void;
    onWidgetContextMenuRequest: (e: React.MouseEvent, widgetId: string) => void;
    // Props for recursive sections
    onWidgetDrop: (sectionId: string, columnIndex: number, widgetType: string, dropIndex: number) => void;
    onSectionDrop: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
    onSectionSelect: (sectionId: string | null) => void;
    selectedSectionId: string | null;
    onColumnSelect: (columnId: string | null) => void;
    selectedColumnId: string | null;
    onContextMenuRequest: (e: React.MouseEvent, sectionId: string) => void;
    onColumnCountChange: (sectionId: string, count: number) => void;
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
        selectedWidgetId, 
        onWidgetSelect, 
        onWidgetMove,
        isSelected,
        onSelect,
        onAddWidgetClick,
        onWidgetContextMenuRequest,
    } = props;
    const { id: columnId, widgets } = columnData;
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    const addButtonRef = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);

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
        return Object.values(widget.styles).reduce((acc, group) => ({ ...acc, ...group }), {});
    };

    const handleColumnClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            e.stopPropagation();
            onSelect(columnId);
        }
    };

    const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (addButtonRef.current) {
            onAddWidgetClick(sectionId, columnIndex, widgets.length, addButtonRef.current);
        }
    };

    const columnStyle: React.CSSProperties = {
        ...styles.column,
        border: isSelected ? '2px solid #28a745' : '1px dashed #555',
        backgroundColor: columnData.styles?.backgroundColor || 'transparent',
        padding: columnData.styles?.padding || '0.5rem',
        gap: `${columnData.styles?.rowGap || 8}px`,
        zIndex: 2,
    };
    
    const addButtonContainerStyle = isHovered 
        ? {...styles.addButtonContainer, ...styles.addButtonContainerHover} 
        : styles.addButtonContainer;

    return (
        <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onClick={handleColumnClick}
            style={columnStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {widgets.length === 0 && dropIndex === null && !isHovered && (
                <div style={styles.placeholder}>Drop Widget Here</div>
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
                            >
                            {(() => {
                                const widget = item as WidgetData;
                                const Component = componentRegistry[widget.componentType];
                                const isWidgetSelected = widget.id === selectedWidgetId;
                                const combinedStyles = getCombinedStyles(widget);
    
                                const wrapperStyle = isWidgetSelected 
                                    ? { ...styles.widgetWrapper, ...combinedStyles, ...styles.selectedWidgetWrapper } 
                                    : { ...styles.widgetWrapper, ...combinedStyles };
    
                                return (
                                    <div 
                                        style={wrapperStyle}
                                        onClick={(e) => { e.stopPropagation(); onWidgetSelect(widget); }}
                                        onContextMenu={(e) => onWidgetContextMenuRequest(e, widget.id)}
                                    >
                                        {Component ? (
                                            <Component {...widget.props} styles={widget.styles} />
                                        ) : (
                                            <div style={styles.errorWrapper}>
                                                Unknown Widget: {widget.componentType}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                            </div>
                        ) : (
                             <div data-widget-index={index}>
                                {(() => {
                                    const section = item as SectionData;
                                    const handleNestedDragStart = (e: React.DragEvent) => {
                                        e.stopPropagation();
                                        const payload = JSON.stringify({
                                            widgetId: section.id,
                                            sourceSectionId: sectionId,
                                            sourceColumnIndex: columnIndex,
                                        });
                                        e.dataTransfer.setData(WIDGET_DRAG_TYPE, payload);
                                        e.dataTransfer.effectAllowed = 'move';
                                    };
                                    return (
                                        <Section
                                            {...props}
                                            sectionData={section}
                                            isSectionSelected={section.id === props.selectedSectionId}
                                            isNested={true}
                                            onCustomDragStart={handleNestedDragStart}
                                        />
                                    );
                                })()}
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
             {dropIndex === widgets.length && <div style={styles.dropIndicator} />}
            <div style={addButtonContainerStyle}>
                <button ref={addButtonRef} onClick={handleAddClick} style={styles.addButton} title="Add Widget">
                    +
                </button>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    column: {
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'border-color 0.2s, background-color 0.2s',
        minHeight: '60px',
    },
    placeholder: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#666',
        fontSize: '0.8rem',
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minHeight: '40px',
    },
    widgetWrapper: {
        border: '2px solid transparent',
        borderRadius: '3px',
        cursor: 'pointer',
        overflow: 'hidden',
    },
    selectedWidgetWrapper: {
        borderColor: '#007acc',
    },
    errorWrapper: {
        backgroundColor: '#5c2323',
        color: '#ffc1c1',
        padding: '1rem',
        borderColor: '#ff8080',
    },
    dropIndicator: {
        height: '4px',
        backgroundColor: '#00aaff',
        borderRadius: '2px',
        margin: '-2px 0',
    },
    addButtonContainer: {
        position: 'absolute',
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        opacity: 0,
        transition: 'opacity 0.2s ease-in-out',
        pointerEvents: 'none', // Initially not interactive
    },
    addButtonContainerHover: {
        opacity: 1,
        pointerEvents: 'auto', // Make interactive on hover
    },
    addButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(0, 122, 204, 0.5)',
        color: '#00aaff',
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
    }
};

export default Column;