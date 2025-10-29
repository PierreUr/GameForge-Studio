import React from 'react';
import { SectionData, WidgetData } from '../UIEditorPanel';
import Column from './Column';

interface SectionProps {
    sectionData: SectionData;
    onWidgetDrop: (sectionId: string, columnIndex: number, widgetType: string) => void;
    onLayoutChange: (sectionId: string, newColumnCount: number) => void;
    selectedWidgetId: string | null;
    onWidgetSelect: (widgetData: WidgetData) => void;
}

const Section: React.FC<SectionProps> = ({ sectionData, onWidgetDrop, onLayoutChange, selectedWidgetId, onWidgetSelect }) => {
    const { id, columns, columnLayout } = sectionData;

    const columnLayouts = [1, 2, 3, 4];

    return (
        <div style={styles.section}>
            <div style={styles.controls}>
                <span>Columns:</span>
                {columnLayouts.map(count => (
                     <button 
                        key={count} 
                        onClick={() => onLayoutChange(id, count)}
                        style={columnLayout === count ? {...styles.controlButton, ...styles.activeButton} : styles.controlButton}
                    >
                        {count}
                    </button>
                ))}
            </div>
            <div style={{ ...styles.columnsContainer, gridTemplateColumns: `repeat(${columnLayout}, 1fr)` }}>
                {columns.map((col, index) => (
                    <Column
                        key={col.id}
                        widgets={col.widgets}
                        onDrop={(widgetType) => onWidgetDrop(id, index, widgetType)}
                        selectedWidgetId={selectedWidgetId}
                        onWidgetSelect={onWidgetSelect}
                    />
                ))}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    section: {
        backgroundColor: '#252526',
        border: '1px solid #4a4a4a',
        borderRadius: '4px',
        padding: '1rem',
        position: 'relative',
    },
    controls: {
        position: 'absolute',
        top: '-15px',
        left: '10px',
        backgroundColor: '#007acc',
        color: 'white',
        borderRadius: '4px',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        zIndex: 10,
    },
    controlButton: {
        backgroundColor: 'transparent',
        border: '1px solid white',
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
        backgroundColor: 'white',
        color: '#007acc',
        fontWeight: 'bold',
    },
    columnsContainer: {
        display: 'grid',
        gap: '1rem',
        paddingTop: '1rem', // Space for controls
    },
};

export default Section;