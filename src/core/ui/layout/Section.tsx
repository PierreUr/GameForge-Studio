import React, { useState, useEffect } from 'react';
import { SectionData, WidgetData } from '../UIEditorPanel';
import Column from './Column';

interface SectionProps {
    sectionData: SectionData;
    onWidgetDrop: (sectionId: string, columnIndex: number, widgetType: string, dropIndex: number) => void;
    selectedWidgetId: string | null;
    onWidgetSelect: (widgetData: WidgetData) => void;
    onSectionDrop: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
    onWidgetMove: (source: any, target: any) => void;
    isSectionSelected: boolean;
    onSectionSelect: (sectionId: string) => void;
    selectedColumnId: string | null;
    onColumnSelect: (columnId: string) => void;
    onContextMenuRequest: (e: React.MouseEvent, sectionId: string) => void;
    onColumnCountChange: (sectionId: string, count: number) => void;
    onAddWidgetClick: (sectionId: string, columnIndex: number, insertIndex: number, anchorEl: HTMLElement) => void;
}

const SECTION_DRAG_TYPE = 'application/gameforge-section-id';

const Section: React.FC<SectionProps> = ({ 
    sectionData, 
    onWidgetDrop, 
    selectedWidgetId, 
    onWidgetSelect, 
    onSectionDrop, 
    onWidgetMove, 
    isSectionSelected, 
    onSectionSelect,
    selectedColumnId,
    onColumnSelect,
    onContextMenuRequest,
    onColumnCountChange,
    onAddWidgetClick
}) => {
    const { id, columns, columnLayout, isSpacer, padding, columnGap, margin, backgroundColor, height, minHeight, alignItems } = sectionData;
    const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData(SECTION_DRAG_TYPE, id);
        e.dataTransfer.effectAllowed = 'move';
        e.stopPropagation();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Always allow dropping on the section itself.
        if (e.dataTransfer.types.includes(SECTION_DRAG_TYPE)) {
            e.stopPropagation(); // Only stop propagation if we are handling a section drag
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const middleY = rect.top + rect.height / 2;
            setDropPosition(e.clientY < middleY ? 'before' : 'after');
        } else {
            // If it's not a section drag (e.g., a widget), don't show a section drop indicator.
            // Let the event continue to the column.
            setDropPosition(null);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDropPosition(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        // Only handle the drop if it's a section being dropped.
        if (e.dataTransfer.types.includes(SECTION_DRAG_TYPE)) {
            e.preventDefault();
            e.stopPropagation(); // Stop here, we've handled it.
            const draggedId = e.dataTransfer.getData(SECTION_DRAG_TYPE);
            if (draggedId && draggedId !== id && dropPosition) {
                onSectionDrop(draggedId, id, dropPosition);
            }
        }
        // If it's not a section drop, we do nothing and let the event bubble
        // or be handled by a child (like Column).
        setDropPosition(null);
    };

    const handleSectionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSectionSelect(id);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenuRequest(e, id);
    };
    
    // Minimalist view for spacer sections
    if (isSpacer) {
        const spacerWidget = sectionData.columns[0]?.widgets[0];
        if (!spacerWidget) return null;

        const spacerStyle = isSectionSelected ? {...styles.spacerWrapper, ...styles.selectedSpacer} : styles.spacerWrapper;

        return (
             <div 
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
                         <div style={styles.dragHandle} draggable onDragStart={handleDragStart} onClick={(e) => { e.stopPropagation(); onSectionSelect(id); }}>⠿</div>
                    )}
                    <div style={{height: `${spacerWidget.props.height || 20}px`, backgroundColor: '#444', width: '100%', borderRadius: '2px'}} onClick={(e) => { e.stopPropagation(); onWidgetSelect(spacerWidget)}}></div>
                </div>
                {dropPosition === 'after' && <div style={{...styles.dropIndicator, bottom: -2}} />}
            </div>
        )
    }

    const sectionStyle: React.CSSProperties = {
        ...styles.section,
        padding: padding ?? '0px',
        margin: margin ?? '0 0 16px 0',
        border: isSectionSelected ? '2px solid #007acc' : '1px solid #4a4a4a',
        backgroundColor: backgroundColor || 'transparent',
    };
    
    const columnsContainerStyle: React.CSSProperties = {
        ...styles.columnsContainer,
        gridTemplateColumns: `repeat(${columnLayout}, 1fr)`,
        gap: `${columnGap ?? 16}px`,
        height: height,
        minHeight: minHeight,
        alignItems: alignItems,
    };

    return (
        <div 
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
                    style={styles.dragHandle} 
                    draggable 
                    onDragStart={handleDragStart} 
                    onClick={(e) => { e.stopPropagation(); onSectionSelect(id); }}
                    title="Drag to reorder section. Click to select."
                >
                    ⠿
                </div>
            )}
            <div style={columnsContainerStyle}>
                {columns.map((col, index) => (
                    <Column
                        key={col.id}
                        columnData={col}
                        sectionId={id}
                        columnIndex={index}
                        onDrop={(widgetType, dropIdx) => onWidgetDrop(id, index, widgetType, dropIdx)}
                        selectedWidgetId={selectedWidgetId}
                        onWidgetSelect={onWidgetSelect}
                        onWidgetMove={onWidgetMove}
                        isSelected={col.id === selectedColumnId}
                        onSelect={onColumnSelect}
                        onAddWidgetClick={(insertIndex, anchorEl) => onAddWidgetClick(id, index, insertIndex, anchorEl)}
                    />
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
        padding: '4px 20px', // Add padding to make space for handle
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
    columnsContainer: {
        display: 'grid',
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