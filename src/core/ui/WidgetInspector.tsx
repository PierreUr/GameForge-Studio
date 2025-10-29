import React from 'react';
import { WidgetData } from './UIEditorPanel';
import NumberInput from './inputs/NumberInput';
import TextInput from './inputs/TextInput';
import BooleanCheckbox from './inputs/BooleanCheckbox';
import { EventBus } from '../ecs/EventBus';

interface WidgetInspectorProps {
    widgetData: WidgetData;
    widgetDefinition: any;
}

const WidgetInspector: React.FC<WidgetInspectorProps> = ({ widgetData, widgetDefinition }) => {
    
    const handlePropertyChange = (propName: string, propValue: any) => {
        EventBus.getInstance().publish('ui-widget:update-prop', {
            widgetId: widgetData.id,
            propName,
            propValue
        });
    };

    const renderPropertyControl = (prop: any) => {
        const key = prop.name;
        const value = widgetData.props[key] ?? prop.defaultValue;
        
        switch (prop.type) {
            case 'number':
                return <NumberInput label={prop.label} value={value} onChange={(newValue) => handlePropertyChange(key, newValue)} />;
            case 'string':
                return <TextInput label={prop.label} value={value} onChange={(newValue) => handlePropertyChange(key, newValue)} />;
            case 'boolean':
                return <BooleanCheckbox label={prop.label} value={value} onChange={(newValue) => handlePropertyChange(key, newValue)} />;
            default:
                 return (
                    <div style={styles.readOnlyItem}>
                        <span>{prop.label}</span>
                        <span>Unsupported type: {prop.type}</span>
                    </div>
                 );
        }
    };

    return (
        <div>
            <h5 style={styles.header}>Widget: {widgetDefinition.name}</h5>
            <div style={styles.container}>
                <div style={styles.propertyList}>
                    {(widgetDefinition.properties || []).length > 0 ? (
                        widgetDefinition.properties.map((prop: any) => (
                            <div key={prop.name} style={styles.propertyItem}>
                                {renderPropertyControl(prop)}
                            </div>
                        ))
                    ) : (
                        <p style={styles.noPropsText}>No editable properties.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    header: {
        margin: '0 0 1rem 0',
        color: '#eee',
        borderBottom: '1px solid #444',
        paddingBottom: '0.5rem',
        fontSize: '1rem'
    },
    container: {
        backgroundColor: '#3a3a3a',
        borderRadius: '4px',
        border: '1px solid #4a4a4a',
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
        color: '#999',
    },
    noPropsText: {
        fontSize: '0.8rem',
        color: '#888',
        fontStyle: 'italic',
        margin: 0,
    }
};

export default WidgetInspector;