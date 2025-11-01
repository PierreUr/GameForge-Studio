import React, { useState, useEffect } from 'react';
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
    const [internalValue, setInternalValue] = useState<string>(String(value));

    useEffect(() => {
        // This effect should only run when the component receives a new 'value' prop from its parent
        // that is different from its internal state. This happens when selecting a new element.
        // It avoids resetting the input while typing.
        if (parseFloat(internalValue) !== value) {
            setInternalValue(String(value));
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInternalValue(e.target.value);
    };

    const handleBlur = () => {
        const parsedValue = parseFloat(internalValue);
        if (!isNaN(parsedValue) && parsedValue !== value) {
            onChange(parsedValue);
        } else {
            // If input is invalid or unchanged, revert to the original value from props
            setInternalValue(String(value));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBlur();
            (e.target as HTMLInputElement).blur();
        } else if (e.key === 'Escape') {
            setInternalValue(String(value));
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
                type="number"
                value={internalValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
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