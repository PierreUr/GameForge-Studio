import React from 'react';
import { IComponent } from '../ecs/Component';
import NumberInput from './inputs/NumberInput';
import TextInput from './inputs/TextInput';
import BooleanCheckbox from './inputs/BooleanCheckbox';
import ColorPicker from './inputs/ColorPicker';

interface ComponentInspectorProps {
    componentName: string;
    componentData: IComponent;
    onDataChange: (componentName: string, propertyKey: string, value: any) => void;
}

const ComponentInspector: React.FC<ComponentInspectorProps> = ({ componentName, componentData, onDataChange }) => {
    
    const handlePropertyChange = (key: string, value: any) => {
        onDataChange(componentName, key, value);
    };

    const renderPropertyControl = (key: string, value: any) => {
        // Special case for color properties
        if (typeof value === 'string' && key.toLowerCase().includes('color')) {
            return <ColorPicker label={key} value={value} onChange={(newValue) => handlePropertyChange(key, newValue)} />;
        }
        
        switch (typeof value) {
            case 'number':
                return <NumberInput label={key} value={value} onChange={(newValue) => handlePropertyChange(key, newValue)} />;
            case 'string':
                return <TextInput label={key} value={value} onChange={(newValue) => handlePropertyChange(key, newValue)} />;
            case 'boolean':
                return <BooleanCheckbox label={key} value={value} onChange={(newValue) => handlePropertyChange(key, newValue)} />;
            case 'object':
                let displayValue: string;
                if (value === null) {
                    displayValue = 'null';
                } else if (value instanceof Map) {
                    displayValue = `Map(${value.size})`; // More concise representation
                } else if (Array.isArray(value)) {
                    displayValue = `Array(${value.length})`;
                } else {
                    displayValue = 'Object';
                }
                 return (
                    <div style={styles.readOnlyItem}>
                        <span style={styles.propertyName}>{key}</span>
                        <span style={styles.propertyValue}>{displayValue}</span>
                    </div>
                );
            default:
                 return (
                    <div style={styles.readOnlyItem}>
                        <span style={styles.propertyName}>{key}</span>
                        <span style={styles.propertyValue}>{String(value)}</span>
                    </div>
                 );
        }
    };

    const properties = Object.entries(componentData).filter(([key]) => key !== 'isActive');

    return (
        <div style={styles.container}>
            <h6 style={styles.header}>{componentName.replace('Component', '')}</h6>
            <div style={styles.propertyList}>
                {properties.length > 0 ? properties.map(([key, value]) => (
                    <div key={key} style={styles.propertyItem}>
                        {renderPropertyControl(key, value)}
                    </div>
                )) : <p style={styles.noPropsText}>No editable properties.</p>}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        backgroundColor: '#3a3a3a',
        borderRadius: '4px',
        marginBottom: '1rem',
        border: '1px solid #4a4a4a',
    },
    header: {
        backgroundColor: '#4a4a4a',
        padding: '0.5rem 0.75rem',
        margin: 0,
        fontSize: '0.9rem',
        color: '#eee',
        borderBottom: '1px solid #333',
        borderTopLeftRadius: '3px',
        borderTopRightRadius: '3px',
    },
    propertyList: {
        padding: '0.75rem',
        fontSize: '0.85rem',
    },
    propertyItem: {
        marginBottom: '0.5rem',
    },
    readOnlyItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    propertyName: {
        color: '#ccc',
        marginRight: '1rem',
    },
    propertyValue: {
        color: '#fff',
        backgroundColor: '#2a2a2a',
        padding: '0.2rem 0.4rem',
        borderRadius: '3px',
        fontFamily: 'monospace',
        fontSize: '0.8rem',
        maxWidth: '150px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    noPropsText: {
        fontSize: '0.8rem',
        color: '#888',
        fontStyle: 'italic',
        margin: 0,
    }
};

export default ComponentInspector;