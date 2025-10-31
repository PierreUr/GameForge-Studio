import React, { useState } from 'react';
import { WidgetData } from './UIEditorPanel';
import NumberInput from './inputs/NumberInput';
import TextInput from './inputs/TextInput';
import BooleanCheckbox from './inputs/BooleanCheckbox';
import ColorPicker from './inputs/ColorPicker';
import SelectInput from './inputs/SelectInput';
import { EventBus } from '../ecs/EventBus';
import InspectorHelpTooltip from './InspectorHelpTooltip';

interface WidgetInspectorProps {
    widgetData: WidgetData;
    widgetDefinition: any;
    isHelpVisible: boolean;
    onSelectParentColumn: () => void;
}

const InspectorGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div style={styles.groupContainer}>
            <button style={styles.groupHeaderButton} onClick={() => setIsOpen(!isOpen)}>
                <span style={{...styles.arrow, transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'}}>►</span>
                {title}
            </button>
            {isOpen && <div style={styles.groupContent}>{children}</div>}
        </div>
    );
};

const WidgetInspector: React.FC<WidgetInspectorProps> = ({ widgetData, widgetDefinition, isHelpVisible, onSelectParentColumn }) => {

    const handlePropertyChange = (propName: string, propValue: any) => {
        EventBus.getInstance().publish('ui-widget:update-prop', {
            widgetId: widgetData.id, propName, propValue
        });
    };

    const handleStyleChange = (groupName: string, propName: string, propValue: any) => {
        let valueToSave = propValue;
        
        // Find the property definition to check its type
        const propDef = widgetDefinition.styles?.[groupName]?.find((p: any) => p.name === propName);

        // If the property is defined as a number, append 'px'
        if (propDef && propDef.type === 'number') {
            valueToSave = `${propValue}px`;
        }

        const newGroupStyles = { ...(widgetData.styles?.[groupName] || {}), [propName]: valueToSave };
        const newStyles = { ...(widgetData.styles || {}), [groupName]: newGroupStyles };
        
        EventBus.getInstance().publish('ui-widget:update-prop', {
            widgetId: widgetData.id, propName: 'styles', propValue: newStyles
        });
    };
    
    const handleDeleteWidget = () => {
        if (window.confirm('Are you sure you want to delete this widget?')) {
            EventBus.getInstance().publish('ui-widget:delete', { widgetId: widgetData.id });
        }
    };

    const renderPropertyControl = (prop: any, isStyle: boolean = false, groupName: string = '') => {
        const key = prop.name;
        let value = isStyle 
            ? widgetData.styles?.[groupName]?.[key] ?? prop.defaultValue
            : widgetData.props[key] ?? prop.defaultValue;

        // If the manifest type is 'number', parse the stored string value (e.g., "24px") back to a number for the input.
        if (prop.type === 'number' && typeof value === 'string') {
            value = parseFloat(value) || 0;
        }
        
        const onChange = isStyle 
            ? (newValue: any) => handleStyleChange(groupName, key, newValue)
            : (newValue: any) => handlePropertyChange(key, newValue);

        const commonProps = {
            label: prop.label || key,
            value: value,
            onChange: onChange,
            isHelpVisible: isHelpVisible,
            helpText: prop.description
        };

        switch (prop.type) {
            case 'number':
                return <NumberInput {...commonProps} />;
            case 'string':
                return <TextInput {...commonProps} />;
            case 'boolean':
                return <BooleanCheckbox {...commonProps} />;
            case 'color':
                return <ColorPicker {...commonProps} />;
            case 'select':
                return <SelectInput {...commonProps} options={prop.options} />;
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
            <div style={styles.header}>
                <span>Widget: {widgetDefinition.name}</span>
                <button onClick={handleDeleteWidget} style={styles.deleteIcon} title="Delete Widget">
                    &times;
                </button>
            </div>
            
            <div style={styles.columnEditContainer}>
                <button onClick={onSelectParentColumn} style={styles.columnEditButton}>
                    Edit Column Styles
                </button>
            </div>

            {widgetDefinition.properties && widgetDefinition.properties.length > 0 && (
                 <InspectorGroup title="Properties">
                    {widgetDefinition.properties.map((prop: any) => (
                        <div key={prop.name} style={styles.propertyItem}>
                            {renderPropertyControl(prop)}
                        </div>
                    ))}
                </InspectorGroup>
            )}

            {widgetDefinition.styles && Object.entries(widgetDefinition.styles).map(([groupName, props]: [string, any]) => (
                <InspectorGroup key={groupName} title={groupName.charAt(0).toUpperCase() + groupName.slice(1)}>
                     {props.map((prop: any) => (
                        <div key={prop.name} style={styles.propertyItem}>
                            {renderPropertyControl(prop, true, groupName)}
                        </div>
                    ))}
                </InspectorGroup>
            ))}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    header: {
        margin: '0 0 1rem 0',
        color: '#eee',
        borderBottom: '1px solid #444',
        paddingBottom: '0.5rem',
        fontSize: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deleteIcon: {
        background: '#7a2d2d',
        border: '1px solid #9e2b25',
        color: 'white',
        cursor: 'pointer',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        lineHeight: '20px',
        padding: 0,
    },
    columnEditContainer: {
        marginBottom: '1rem',
    },
    columnEditButton: {
        width: '100%',
        backgroundColor: '#4a4a4a',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.5rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        textAlign: 'center',
    },
    groupContainer: {
        backgroundColor: '#3a3a3a',
        borderRadius: '4px',
        marginBottom: '1rem',
        border: '1px solid #4a4a4a',
    },
    groupHeaderButton: {
        backgroundColor: '#4a4a4a',
        padding: '0.5rem 0.75rem',
        margin: 0,
        fontSize: '0.9rem',
        color: '#eee',
        border: 'none',
        borderBottom: '1px solid #333',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
    },
    arrow: {
        display: 'inline-block',
        marginRight: '0.5rem',
        transition: 'transform 0.2s',
    },
    groupContent: {
        padding: '0.75rem',
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
};

export default WidgetInspector;