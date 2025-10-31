import React from 'react';
import InspectorHelpTooltip from '../InspectorHelpTooltip';

interface TextInputProps {
    label: string;
    value: string;
    onChange: (newValue: string) => void;
    isHelpVisible?: boolean;
    helpText?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, isHelpVisible, helpText }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div style={styles.container}>
            <div style={styles.labelContainer}>
                <label style={styles.label}>{label}</label>
                {isHelpVisible && helpText && <InspectorHelpTooltip text={helpText} />}
            </div>
            <input
                type="text"
                value={value}
                onChange={handleChange}
                style={styles.input}
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
        width: '168px',
        backgroundColor: '#2a2a2a',
        color: '#eee',
        border: '1px solid #555',
        borderRadius: '3px',
        padding: '0.2rem 0.4rem',
        fontFamily: 'monospace',
        fontSize: '0.8rem',
    }
};

export default TextInput;