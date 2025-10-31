import React, { useState, useRef } from 'react';
import { WidgetData, componentRegistry, ColumnData } from '../UIEditorPanel';

interface ColumnProps {
    columnData: ColumnData;
    sectionId: string;
    columnIndex: number;
    onDrop: (widgetType: string, dropIndex: number) => void;
    selectedWidgetId: string | null;
    onWidgetSelect: (widgetData: WidgetData) => void;
    onWidgetMove: (source: any, target: any) => void;
    isSelected: boolean;
    onSelect: (columnId: string) => void;
    onAddWidgetClick: (insertIndex: number, anchorEl: HTMLElement) => void;
}

const WIDGET_DRAG_TYPE = 'application/gameforge-widget';
const SECTION_DRAG_TYPE = 'application/gameforge-section-id';

const Column: React.FC<ColumnProps> = ({ 
    columnData, 
    sectionId, 
    columnIndex, 
    onDrop, 
    selectedWidgetId, 
    onWidgetSelect, 
    onWidgetMove,
    isSelected,
    onSelect,
    onAddWidgetClick
}) => {
    const { id: columnId, widgets } = columnData;
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    const addButtonRef = useRef<HTMLButtonElement>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (e.dataTransfer.types.includes(SECTION_DRAG_TYPE)) {
            setDropIndex(null);
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.types.includes(WIDGET_DRAG_TYPE) || e.dataTransfer.types.includes('text/plain')) {
            e.dataTransfer.dropEffect = e.dataTransfer.types.includes(WIDGET_DRAG_TYPE) ? 'move' : 'copy';
            
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
        if (e.dataTransfer.types.includes(SECTION_DRAG_TYPE)) {
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
            const widgetType = e.dataTransfer.getData('text/plain');
            if (dropIndex !== null) {
                onDrop(widgetType, dropIndex);
            }
        }
        
        setDropIndex(null);
    };

    const handleWidgetDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.stopPropagation();
        const payload = JSON.stringify({ 
            widgetId: widgets[index].id,
            sourceSectionId: sectionId,
            sourceColumnIndex: columnIndex,
        });
        e.dataTransfer.setData(WIDGET_DRAG_TYPE, payload);
        e.dataTransfer.effectAllowed = 'move';
    };

    const getCombinedStyles = (widget: WidgetData): React.CSSProperties => {
        if (!widget.styles) return {};
        // Flatten all style groups (spacing, background, border, etc.) into a single style object.
        return Object.values(widget.styles).reduce((acc, group) => ({ ...acc, ...group }), {});
    };

    const handleColumnClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(columnId);
    };

    const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (addButtonRef.current) {
            onAddWidgetClick(widgets.length, addButtonRef.current);
        }
    };

    const columnStyle: React.CSSProperties = {
        ...styles.column,
        border: isSelected ? '2px solid #28a745' : '1px dashed #555',
        backgroundColor: columnData.styles?.backgroundColor || 'transparent',
        padding: columnData.styles?.padding || '0.5rem',
        gap: `${columnData.styles?.rowGap || 8}px`,
        zIndex: 2, // Fix for ensuring column is clickable over section
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onClick={handleColumnClick}
            style={columnStyle}
        >
            {widgets.length === 0 && dropIndex === null && (
                <div style={styles.placeholder}>Drop Widget Here</div>
            )}
            {widgets.map((widget, index) => {
                const Component = componentRegistry[widget.componentType];
                const isWidgetSelected = widget.id === selectedWidgetId;
                const combinedStyles = getCombinedStyles(widget);

                const wrapperStyle = isWidgetSelected 
                    ? { ...styles.widgetWrapper, ...combinedStyles, ...styles.selectedWidgetWrapper } 
                    : { ...styles.widgetWrapper, ...combinedStyles };

                return (
                    <React.Fragment key={widget.id}>
                        {dropIndex === index && <div style={styles.dropIndicator} />}
                        <div 
                            data-widget-index={index}
                            style={wrapperStyle}
                            onClick={(e) => { e.stopPropagation(); onWidgetSelect(widget); }}
                            draggable
                            onDragStart={(e) => handleWidgetDragStart(e, index)}
                        >
                            {Component ? (
                                <Component {...widget.props} styles={widget.styles} />
                            ) : (
                                <div style={styles.errorWrapper}>
                                    Unknown Widget: {widget.componentType}
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}
             {dropIndex === widgets.length && <div style={styles.dropIndicator} />}
            <div style={styles.addButtonContainer}>
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
        minHeight: '60px', // Ensure column is droppable even when empty
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
        overflow: 'hidden', // This is crucial for border-radius to clip content
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
        display: 'flex',
        justifyContent: 'center',
        padding: '8px 0',
    },
    addButton: {
        backgroundColor: 'rgba(74, 74, 74, 0.5)',
        border: '1px dashed #666',
        color: '#999',
        cursor: 'pointer',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        lineHeight: '28px',
    }
};

export default Column;