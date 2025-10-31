import React from 'react';
import InspectorHelpTooltip from '../InspectorHelpTooltip';

interface NumberInputProps {
    label: string;
    value: number;
    onChange: (newValue: number) => void;
    disabled?: boolean;
    isHelpVisible?: boolean;
    helpText?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, disabled = false, isHelpVisible, helpText }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(parseFloat(e.target.value));
    };

    return (
        <div style={styles.container}>
            <div style={styles.labelContainer}>
                <label style={styles.label}>{label}</label>
                {isHelpVisible && helpText && <InspectorHelpTooltip text={helpText} />}
            </div>
            <input
                type="number"
                value={value}
                onChange={handleChange}
                style={disabled ? { ...styles.input, ...styles.disabledInput } : styles.input}
                disabled={disabled}
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
        fontSize: '0.95rem',
        textTransform: 'capitalize',
    },
    input: {
        width: '84px',
        backgroundColor: '#2a2a2a',
        color: '#eee',
        border: '1px solid #555',
        borderRadius: '3px',
        padding: '0.2rem 0.4rem',
        fontFamily: 'monospace',
        fontSize: '0.8rem',
        textAlign: 'right',
    },
    disabledInput: {
        backgroundColor: '#222',
        color: '#888',
        cursor: 'not-allowed',
    }
};

export default NumberInput;