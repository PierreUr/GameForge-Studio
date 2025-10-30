import React from 'react';
import InspectorHelpTooltip from '../InspectorHelpTooltip';

interface BooleanCheckboxProps {
    label: string;
    value: boolean;
    onChange: (newValue: boolean) => void;
    isHelpVisible?: boolean;
    helpText?: string;
}

const BooleanCheckbox: React.FC<BooleanCheckboxProps> = ({ label, value, onChange, isHelpVisible, helpText }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
    };

    return (
        <div style={styles.container}>
            <div style={styles.labelContainer}>
                <label style={styles.label}>{label}</label>
                {isHelpVisible && helpText && <InspectorHelpTooltip text={helpText} />}
            </div>
            <input
                type="checkbox"
                checked={value}
                onChange={handleChange}
                style={styles.checkbox}
            />
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    labelContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    label: {
        color: '#ccc',
        fontSize: '0.85rem',
        textTransform: 'capitalize',
    },
    checkbox: {
        cursor: 'pointer',
    }
};

export default BooleanCheckbox;