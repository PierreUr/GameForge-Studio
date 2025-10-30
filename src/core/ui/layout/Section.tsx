import React, { useState } from 'react';
import { SectionData, WidgetData } from '../UIEditorPanel';
import Column from './Column';

interface SectionProps {
    sectionData: SectionData;
    onWidgetDrop: (sectionId: string, columnIndex: number, widgetType: string) => void;
    onLayoutChange: (sectionId: string, newColumnCount: number) => void;
    selectedWidgetId: string | null;
    onWidgetSelect: (widgetData: WidgetData) => void;
    onSectionDrop: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
    onWidgetMove: (source: any, target: any) => void;
    isSectionSelected: boolean;
    onSectionSelect: (sectionId: string) => void;
    selectedColumnId: string | null;
    onColumnSelect: (columnId: string) => void;
}

const SECTION_DRAG_TYPE = 'application/gameforge-section-id';

const Section: React.FC<SectionProps> = ({ 
    sectionData, 
    onWidgetDrop, 
    onLayoutChange, 
    selectedWidgetId, 
    onWidgetSelect, 
    onSectionDrop, 
    onWidgetMove, 
    isSectionSelected, 
    onSectionSelect,
    selectedColumnId,
    onColumnSelect,
}) => {
    const { id, columns, columnLayout, isSpacer, padding, columnGap, margin, backgroundColor } = sectionData;
    const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

    const columnLayouts = [1, 2, 3, 4];

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData(SECTION_DRAG_TYPE, id);
        e.dataTransfer.effectAllowed = 'move';
        e.stopPropagation();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes(SECTION_DRAG_TYPE)) {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const middleY = rect.top + rect.height / 2;
            setDropPosition(e.clientY < middleY ? 'before' : 'after');
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
        
        if (e.dataTransfer.types.includes(SECTION_DRAG_TYPE)) {
            const draggedId = e.dataTransfer.getData(SECTION_DRAG_TYPE);
            if (draggedId && draggedId !== id && dropPosition) {
                onSectionDrop(draggedId, id, dropPosition);
            }
        }
        setDropPosition(null);
    };

    const handleSectionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSectionSelect(id);
    };
    
    // Minimalist view for spacer sections
    if (isSpacer) {
        const spacerWidget = sectionData.columns[0]?.widgets[0];
        if (!spacerWidget) return null;

        return (
             <div 
                style={styles.spacerSection}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
             >
                {dropPosition === 'before' && <div style={{...styles.dropIndicator, top: -2}} />}
                <div style={styles.spacerWrapper}>
                    <div style={styles.spacerDragHandle} draggable onDragStart={handleDragStart}>⠿</div>
                    <div style={{height: `${spacerWidget.props.height || 20}px`, backgroundColor: '#444', width: '100%', borderRadius: '2px'}} onClick={() => onWidgetSelect(spacerWidget)}></div>
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
    };


    return (
        <div 
            style={sectionStyle}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleSectionClick}
        >
            {dropPosition === 'before' && <div style={{...styles.dropIndicator, top: -4}} />}
            <div style={styles.controls}>
                <div style={styles.dragHandle} draggable onDragStart={handleDragStart}>⠿</div>
                <span>Columns:</span>
                {columnLayouts.map(count => (
                     <button 
                        key={count} 
                        onClick={(e) => { e.stopPropagation(); onLayoutChange(id, count); }}
                        style={columnLayout === count ? {...styles.controlButton, ...styles.activeButton} : styles.controlButton}
                    >
                        {count}
                    </button>
                ))}
            </div>
            <div style={columnsContainerStyle}>
                {columns.map((col, index) => (
                    <Column
                        key={col.id}
                        columnData={col}
                        sectionId={id}
                        columnIndex={index}
                        onDrop={(widgetType) => onWidgetDrop(id, index, widgetType)}
                        selectedWidgetId={selectedWidgetId}
                        onWidgetSelect={onWidgetSelect}
                        onWidgetMove={onWidgetMove}
                        isSelected={col.id === selectedColumnId}
                        onSelect={onColumnSelect}
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
        padding: '4px 0',
    },
    spacerWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    spacerDragHandle: {
        cursor: 'grab',
        color: '#888',
        padding: '4px',
    },
    controls: {
        position: 'absolute',
        top: '-15px',
        left: '10px',
        backgroundColor: '#333',
        color: 'white',
        borderRadius: '4px',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        zIndex: 10,
        border: '1px solid #555'
    },
    dragHandle: {
        cursor: 'grab',
        paddingRight: '8px',
        fontSize: '16px',
        color: '#ccc',
    },
    controlButton: {
        backgroundColor: '#555',
        border: '1px solid #777',
        color: 'white',
        cursor: 'pointer',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: '1',
    },
    activeButton: {
        backgroundColor: '#007acc',
        borderColor: '#007acc',
        fontWeight: 'bold',
    },
    columnsContainer: {
        display: 'grid',
        paddingTop: '1rem', // Space for controls
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