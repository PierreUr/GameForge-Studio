import React from 'react';
import { WidgetData, componentRegistry } from '../UIEditorPanel';

interface ColumnProps {
    widgets: WidgetData[];
    onDrop: (widgetType: string) => void;
    selectedWidgetId: string | null;
    onWidgetSelect: (widgetData: WidgetData) => void;
}

const Column: React.FC<ColumnProps> = ({ widgets, onDrop, selectedWidgetId, onWidgetSelect }) => {
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent the event from bubbling up to parent drop zones
        const widgetType = e.dataTransfer.getData('text/plain');
        onDrop(widgetType);
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={styles.column}
        >
            {widgets.length === 0 ? (
                <div style={styles.placeholder}>Drop Widget Here</div>
            ) : (
                widgets.map(widget => {
                    const Component = componentRegistry[widget.componentType];
                    const isSelected = widget.id === selectedWidgetId;
                    const wrapperStyle = isSelected 
                        ? { ...styles.widgetWrapper, ...styles.selectedWidgetWrapper } 
                        : styles.widgetWrapper;

                    return Component ? (
                        <div 
                            key={widget.id} 
                            style={wrapperStyle}
                            onClick={() => onWidgetSelect(widget)}
                        >
                            <Component {...widget.props} />
                        </div>
                    ) : (
                         <div key={widget.id} style={{...styles.widgetWrapper, ...styles.errorWrapper}}>
                            Unknown Widget: {widget.componentType}
                        </div>
                    );
                })
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    column: {
        minHeight: '200px',
        backgroundColor: '#333',
        borderRadius: '4px',
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        border: '1px dashed #555',
    },
    placeholder: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#666',
        fontSize: '0.9rem',
        textAlign: 'center',
    },
    widgetWrapper: {
        border: '2px solid transparent',
        backgroundColor: '#252526',
        borderRadius: '3px',
        cursor: 'pointer',
    },
    selectedWidgetWrapper: {
        borderColor: '#007acc',
    },
    errorWrapper: {
        backgroundColor: '#5c2323',
        color: '#ffc1c1',
        padding: '1rem',
        borderColor: '#ff8080',
    }
};

export default Column;