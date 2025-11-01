import React, { useState, useEffect } from 'react';
import InspectorHelpTooltip from '../InspectorHelpTooltip';

interface TextInputProps {
    label: string;
    value: string;
    onChange: (newValue: string) => void;
    isHelpVisible?: boolean;
    helpText?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, isHelpVisible, helpText }) => {
    const [internalValue, setInternalValue] = useState(value);

    useEffect(() => {
        // This effect should only run when the component receives a new 'value' prop from its parent
        // that is different from its internal state. This happens when selecting a new element.
        // It avoids resetting the input while typing.
        if (internalValue !== value) {
            setInternalValue(value);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInternalValue(e.target.value);
    };

    const handleBlur = () => {
        if (internalValue !== value) {
            onChange(internalValue);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBlur();
            (e.target as HTMLInputElement).blur();
        } else if (e.key === 'Escape') {
            setInternalValue(value);
             (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.labelContainer}>
                <label style={styles.label}>{label}</label>
                {isHelpVisible && helpText && <InspectorHelpTooltip text={helpText} />}
            </div>
            <input
                type="text"
                value={internalValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
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