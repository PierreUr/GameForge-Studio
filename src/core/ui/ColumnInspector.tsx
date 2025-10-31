import React from 'react';
import { ColumnData } from './UIEditorPanel';
import ColorPicker from './inputs/ColorPicker';
import TextInput from './inputs/TextInput';
import NumberInput from './inputs/NumberInput';

interface ColumnInspectorProps {
    columnData: ColumnData;
    onPropertyChange: (columnId: string, propName: string, value: any) => void;
    isHelpVisible: boolean;
}

const ColumnInspector: React.FC<ColumnInspectorProps> = ({ columnData, onPropertyChange, isHelpVisible }) => {

    const handleStyleChange = (propName: string, value: any) => {
        onPropertyChange(columnData.id, propName, value);
    };

    return (
        <div>
            <h5 style={styles.header}>Column Properties</h5>
            <div style={styles.propertyList}>
                <div style={styles.propertyItem}>
                    <NumberInput
                        label="Row Gap (Px)"
                        value={columnData.styles?.rowGap ?? 8}
                        onChange={(value) => handleStyleChange('rowGap', value)}
                        isHelpVisible={isHelpVisible}
                        helpText="The vertical space between widgets inside this column."
                    />
                </div>
                 <div style={styles.propertyItem}>
                    <ColorPicker
                        label="Background Color"
                        value={columnData.styles?.backgroundColor ?? 'transparent'}
                        onChange={(value) => handleStyleChange('backgroundColor', value)}
                        isHelpVisible={isHelpVisible}
                        helpText="The background color of this specific column."
                    />
                </div>
                <div style={styles.propertyItem}>
                    <TextInput
                        label="Padding"
                        value={columnData.styles?.padding ?? '0.5rem'}
                        onChange={(value) => handleStyleChange('padding', value)}
                        isHelpVisible={isHelpVisible}
                        helpText="The inner space of the column. Use CSS format (e.g., '10px')."
                    />
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
    propertyList: {
        backgroundColor: '#3a3a3a',
        borderRadius: '4px',
        padding: '0.75rem',
        border: '1px solid #4a4a4a',
    },
    propertyItem: {
        marginBottom: '0.5rem',
    },
};

export default ColumnInspector;