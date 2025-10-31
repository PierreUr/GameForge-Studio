import React from 'react';
import { SectionData } from './UIEditorPanel';
import NumberInput from './inputs/NumberInput';
import TextInput from './inputs/TextInput';
import ColorPicker from './inputs/ColorPicker';
import SelectInput from './inputs/SelectInput';

interface SectionInspectorProps {
    sectionData: SectionData;
    onPropertyChange: (sectionId: string, propName: string, value: any) => void;
    onColumnCountChange: (sectionId: string, count: number) => void;
    isHelpVisible: boolean;
}

const SectionInspector: React.FC<SectionInspectorProps> = ({ sectionData, onPropertyChange, onColumnCountChange, isHelpVisible }) => {

    const handlePropChange = (propName: string, value: any) => {
        onPropertyChange(sectionData.id, propName, value);
    };

    const handleColumnChange = (value: number) => {
        const count = Math.max(1, Math.min(12, value)); // Clamp between 1 and 12
        onColumnCountChange(sectionData.id, count);
    };

    return (
        <div>
            <h5 style={styles.header}>Section Properties</h5>
            <div style={styles.propertyList}>
                <div style={styles.propertyItem}>
                    <NumberInput
                        label="Columns"
                        value={sectionData.columnLayout}
                        onChange={handleColumnChange}
                        isHelpVisible={isHelpVisible}
                        helpText="The number of columns in this section (1-12)."
                    />
                </div>
                <div style={styles.propertyItem}>
                    <ColorPicker
                        label="Background Color"
                        value={sectionData.backgroundColor ?? 'transparent'}
                        onChange={(value) => handlePropChange('backgroundColor', value)}
                        isHelpVisible={isHelpVisible}
                        helpText="The background color for the entire section."
                    />
                </div>
                <div style={styles.propertyItem}>
                    <NumberInput
                        label="Column Gap (px)"
                        value={sectionData.columnGap ?? 16}
                        onChange={(value) => handlePropChange('columnGap', value)}
                        isHelpVisible={isHelpVisible}
                        helpText="The horizontal space between columns inside this section."
                    />
                </div>
                <div style={styles.propertyItem}>
                    <TextInput
                        label="Padding"
                        value={sectionData.padding ?? '0px'}
                        onChange={(value) => handlePropChange('padding', value)}
                        isHelpVisible={isHelpVisible}
                        helpText="The inner space of the section. Use CSS format (e.g., '10px' or '10px 20px')."
                    />
                </div>
                <div style={styles.propertyItem}>
                    <TextInput
                        label="Margin"
                        value={sectionData.margin ?? '0'}
                        onChange={(value) => handlePropChange('margin', value)}
                        isHelpVisible={isHelpVisible}
                        helpText="The outer space of the section, for spacing between sections."
                    />
                </div>
                <div style={styles.propertyItem}>
                    <TextInput
                        label="Height"
                        value={sectionData.height ?? 'auto'}
                        onChange={(value) => handlePropChange('height', value)}
                        isHelpVisible={isHelpVisible}
                        helpText="The fixed height of the section. Use CSS units (e.g., '300px' or '50vh'). 'auto' is default."
                    />
                </div>
                <div style={styles.propertyItem}>
                    <TextInput
                        label="Min Height"
                        value={sectionData.minHeight ?? '100px'}
                        onChange={(value) => handlePropChange('minHeight', value)}
                        isHelpVisible={isHelpVisible}
                        helpText="The minimum height of the section. Use CSS units (e.g., '100px')."
                    />
                </div>
                <div style={styles.propertyItem}>
                    <SelectInput
                        label="Vertical Align"
                        value={sectionData.alignItems ?? 'flex-start'}
                        onChange={(value) => handlePropChange('alignItems', value)}
                        options={['flex-start', 'center', 'flex-end']}
                        isHelpVisible={isHelpVisible}
                        helpText="Vertically align the content within the columns (Top, Center, Bottom)."
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

export default SectionInspector;