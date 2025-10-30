import React from 'react';
import { SectionData } from './UIEditorPanel';
import NumberInput from './inputs/NumberInput';
import TextInput from './inputs/TextInput';
import ColorPicker from './inputs/ColorPicker';

interface SectionInspectorProps {
    sectionData: SectionData;
    onPropertyChange: (sectionId: string, propName: string, value: any) => void;
    isHelpVisible: boolean;
}

const SectionInspector: React.FC<SectionInspectorProps> = ({ sectionData, onPropertyChange, isHelpVisible }) => {

    const handlePropChange = (propName: string, value: any) => {
        onPropertyChange(sectionData.id, propName, value);
    };

    return (
        <div>
            <h5 style={styles.header}>Section Properties</h5>
            <div style={styles.propertyList}>
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
                        value={sectionData.margin ?? '0 0 16px 0'}
                        onChange={(value) => handlePropChange('margin', value)}
                        isHelpVisible={isHelpVisible}
                        helpText="The outer space of the section, for spacing between sections."
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