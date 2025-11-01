import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SectionData, WidgetData } from '../UIEditorPanel';
import Column from './Column';
import { EventBus } from '../../ecs/EventBus';

interface SectionProps {
    sectionData: SectionData;
    onWidgetDrop: (sectionId: string, columnIndex: number, widgetType: string, dropIndex: number) => void;
    onWidgetSelect: (widgetData: WidgetData, columnId: string, sectionId: string) => void;
    onSectionDrop: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
    onWidgetMove: (source: any, target: any) => void;
    onSectionSelect: (sectionId: string | null) => void;
    onColumnSelect: (columnId: string | null) => void;
    onContextMenuRequest: (e: React.MouseEvent, sectionId: string) => void;
    onAddWidgetClick: (sectionId: string, columnIndex: number, insertIndex: number, anchorEl: HTMLElement) => void;
    onWidgetContextMenuRequest: (e: React.MouseEvent, widgetId: string) => void; 
    onSectionAdd: (targetId: string, position: 'before' | 'after') => void;
    // For recursion
    isNested?: boolean;
    onCustomDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const SECTION_DRAG_TYPE = 'application/gameforge-section-id';


const useColumnResizer = (
    sectionRef: React.RefObject<HTMLDivElement>,
    columnLayout: number,
    columnWidths: number[] | undefined,
    onWidthsChange: (newWidths: number[]) => void
) => {
    const [resizingIndex, setResizingIndex] = useState<number | null>(null);
    const initialDragState = useRef<{ startX: number; initialWidths: number[] } | null>(null);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingIndex(index);
        const currentWidths = columnWidths || Array(columnLayout).fill(1);
        initialDragState.current = {
            startX: e.clientX,
            initialWidths: [...currentWidths],
        };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (resizingIndex === null || !initialDragState.current || !sectionRef.current) return;

        const { startX, initialWidths } = initialDragState.current;
        const deltaX = e.clientX - startX;

        const sectionWidth = sectionRef.current.clientWidth;
        const totalFr = initialWidths.reduce((sum, w) => sum + w, 0);
        
        if (totalFr === 0 || sectionWidth === 0) return;

        const frInPixels = sectionWidth / totalFr;
        const deltaFr = deltaX / frInPixels;

        const newWidths = [...initialWidths];
        
        const leftColIndex = resizingIndex;
        const rightColIndex = resizingIndex + 1;

        const originalLeftFr = initialWidths[leftColIndex];
        const originalRightFr = initialWidths[rightColIndex];

        let newLeftFr = originalLeftFr + deltaFr;
        let newRightFr = originalRightFr - deltaFr;
        
        const minFr = totalFr * 0.05; // 5% minimum width

        if (newLeftFr < minFr) {
            const diff = minFr - newLeftFr;
            newLeftFr = minFr;
            newRightFr -= diff;
        }
        if (newRightFr < minFr) {
            const diff = minFr - newRightFr;
            newRightFr = minFr;
            newLeftFr -= diff;
        }

        newWidths[leftColIndex] = Math.max(0, newLeftFr);
        newWidths[rightColIndex] = Math.max(0, newRightFr);

        onWidthsChange(newWidths);

    }, [resizingIndex, sectionRef, onWidthsChange]);


    const handleMouseUp = useCallback(() => {
        setResizingIndex(null);
        initialDragState.current = null;
    }, []);

    useEffect(() => {
        if (resizingIndex !== null) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
        };
    }, [resizingIndex, handleMouseMove, handleMouseUp]);
    
    return { handleMouseDown };
};


const Section: React.FC<SectionProps> = (props) => {
    const { 
        sectionData, 
        onWidgetDrop, 
        onWidgetSelect, 
        onSectionDrop, 
        onWidgetMove, 
        onSectionSelect,
        onColumnSelect,
        onContextMenuRequest,
        onAddWidgetClick,
        isNested = false,
        onCustomDragStart,
        onWidgetContextMenuRequest,
        onSectionAdd,
    } = props;
    const { id, columns, columnLayout, isSpacer, padding, columnGap, margin, backgroundColor, height, minHeight, maxHeight, alignItems, columnWidths } = sectionData;
    const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isSectionSelected, setIsSectionSelected] = useState(false);

    useEffect(() => {
        const handleSelection = (payload: {type: string, data: any}) => {
            if (payload.type === 'section' && payload.data.id === id) {
                setIsSectionSelected(true);
            } else {
                setIsSectionSelected(false);
            }
        };
        const handleDeselection = () => setIsSectionSelected(false);

        EventBus.getInstance().subscribe('ui-element:selected', handleSelection);
        EventBus.getInstance().subscribe('ui-element:deselected', handleDeselection);
        return () => {
            EventBus.getInstance().unsubscribe('ui-element:selected', handleSelection);
            EventBus.getInstance().unsubscribe('ui-element:deselected', handleDeselection);
        }
    }, [id]);

    const handleWidthsChange = useCallback((newWidths: number[]) => {
        EventBus.getInstance().publish('ui-section:update-prop', { sectionId: id, propName: 'columnWidths', value: newWidths });
    }, [id]);

    const { handleMouseDown } = useColumnResizer(sectionRef, columnLayout, columnWidths, handleWidthsChange);

    useEffect(() => {
        if (columnWidths && columnWidths.length !== columnLayout) {
            handleWidthsChange(Array(columnLayout).fill(1));
        }
    }, [columnLayout, columnWidths, handleWidthsChange]);


    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData(SECTION_DRAG_TYPE, id);
        e.dataTransfer.effectAllowed = 'move';
        e.stopPropagation();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        const isLibrarySectionDrag = e.dataTransfer.types.includes('text/plain') && e.dataTransfer.getData('text/plain') === 'layout-section';
        const isInternalSectionDrag = e.dataTransfer.types.includes(SECTION_DRAG_TYPE);

        if (isLibrarySectionDrag || isInternalSectionDrag) {
            e.stopPropagation(); 
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const middleY = rect.top + rect.height / 2;
            setDropPosition(e.clientY < middleY ? 'before' : 'after');
        } else {
            setDropPosition(null);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDropPosition(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDropPosition(null);

        if (e.dataTransfer.types.includes(SECTION_DRAG_TYPE)) {
            const draggedId = e.dataTransfer.getData(SECTION_DRAG_TYPE);
            if (draggedId && draggedId !== id && dropPosition) {
                onSectionDrop(draggedId, id, dropPosition);
            }
            return;
        }

        if (e.dataTransfer.types.includes('text/plain')) {
            const droppedType = e.dataTransfer.getData('text/plain');
            if (droppedType === 'layout-section' && dropPosition) {
                onSectionAdd(id, dropPosition);
            }
        }
    };

    const handleSectionClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            e.stopPropagation();
            onSectionSelect(id);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenuRequest(e, id);
    };
    
    if (isSpacer) {
        const spacerWidget = sectionData.columns[0]?.widgets[0];
        if (!spacerWidget || !('componentType' in spacerWidget)) return null;

        const spacerStyle = isSectionSelected ? {...styles.spacerWrapper, ...styles.selectedSpacer} : styles.spacerWrapper;

        return (
             <div 
                ref={sectionRef}
                style={styles.spacerSection}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onContextMenu={handleContextMenu}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleSectionClick}
             >
                {dropPosition === 'before' && <div style={{...styles.dropIndicator, top: -2}} />}
                <div style={spacerStyle}>
                    {(isHovered || isSectionSelected) && (
                         <div 
                            style={isNested ? styles.nestedDragHandle : styles.dragHandle}
                            draggable 
                            onDragStart={isNested ? onCustomDragStart : handleDragStart} 
                            onClick={(e) => { e.stopPropagation(); onSectionSelect(id); }}
                            title={isNested ? "Drag nested spacer" : "Drag spacer"}
                        >⠿</div>
                    )}
                    <div style={{height: `${spacerWidget.props.height || 20}px`, backgroundColor: '#444', width: '100%', borderRadius: '2px'}} onClick={(e) => { e.stopPropagation(); onWidgetSelect(spacerWidget as WidgetData, sectionData.columns[0].id, id)}}></div>
                </div>
                {dropPosition === 'after' && <div style={{...styles.dropIndicator, bottom: -2}} />}
            </div>
        )
    }

    const sectionStyle: React.CSSProperties = {
        ...styles.section,
        padding: padding ?? '0px',
        margin: margin ?? '0',
        border: isSectionSelected ? '2px solid #007acc' : '1px solid #4a4a4a',
        backgroundColor: backgroundColor || 'transparent',
    };

    const columnsContainerStyle: React.CSSProperties = {
        ...styles.columnsContainer,
        height: height,
        minHeight: minHeight,
        maxHeight: maxHeight,
        alignItems: alignItems,
    };

    const gapValue = columnGap ?? 0;
    
    // FIX: Define currentWidths to provide a fallback for flexGrow if columnWidths is not set, preventing a render error.
    const currentWidths = columnWidths && columnWidths.length === columnLayout 
        ? columnWidths 
        : Array(columnLayout).fill(1);

    return (
        <div 
            ref={sectionRef}
            style={sectionStyle}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleSectionClick}
            onContextMenu={handleContextMenu}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {dropPosition === 'before' && <div style={{...styles.dropIndicator, top: -4}} />}
            {(isHovered || isSectionSelected) && (
                 <div 
                    style={isNested ? styles.nestedDragHandle : styles.dragHandle} 
                    draggable 
                    onDragStart={isNested ? onCustomDragStart : handleDragStart} 
                    onClick={(e) => { e.stopPropagation(); onSectionSelect(id); }}
                    title={isNested ? "Drag nested section" : "Drag to reorder section"}
                >
                    ⠿
                </div>
            )}
            <div style={columnsContainerStyle}>
                {columns.map((col, index) => (
                    <React.Fragment key={col.id}>
                        {index > 0 && (
                            <div
                                style={{
                                    ...styles.resizer,
                                    marginLeft: `${(gapValue - 5) / 2}px`,
                                    marginRight: `${(gapValue - 5) / 2}px`,
                                }}
                                onMouseDown={(e) => handleMouseDown(e, index - 1)}
                            />
                        )}
                        <div style={{ flexGrow: currentWidths[index], flexBasis: 0, minWidth: '50px', display: 'flex' }}>
                            <Column
                                {...props}
                                key={col.id}
                                columnData={col}
                                sectionId={id}
                                columnIndex={index}
                                onDrop={(widgetType, dropIdx) => onWidgetDrop(id, index, widgetType, dropIdx)}
                                onSelect={onColumnSelect}
                            />
                        </div>
                    </React.Fragment>
                ))}
            </div>
            {dropPosition === 'after' && <div style={{...styles.dropIndicator, bottom: -4}} />}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    section: {
        backgroundColor: 'transparent',
        borderRadius: '4px',
        position: 'relative',
        transition: 'border-color 0.2s, background-color 0.2s',
    },
    spacerSection: {
        position: 'relative',
        padding: '4px 20px', 
    },
    spacerWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        position: 'relative',
        border: '2px solid transparent',
        borderRadius: '4px',
    },
    selectedSpacer: {
        borderColor: '#007acc',
    },
    dragHandle: {
        position: 'absolute',
        top: '50%',
        left: '8px',
        transform: 'translateY(-50%)',
        cursor: 'grab',
        color: '#aaa',
        padding: '8px 4px',
        borderRadius: '4px',
        fontSize: '18px',
        lineHeight: 1,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nestedDragHandle: {
        position: 'absolute',
        top: '4px',
        left: '50%',
        transform: 'translateX(-50%)',
        cursor: 'grab',
        color: 'white',
        backgroundColor: '#3498db',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '14px',
        lineHeight: 1,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
    },
    columnsContainer: {
        display: 'flex',
        zIndex: 1, 
        position: 'relative', 
    },
    resizer: {
        flexShrink: 0,
        width: '5px',
        cursor: 'col-resize',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '2px',
    },
    dropIndicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: '#00aaff',
        zIndex: 20,
        borderRadius: '2px',
        pointerEvents: 'none',
    }
};

export default Section;