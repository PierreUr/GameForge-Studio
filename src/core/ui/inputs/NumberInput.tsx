import React from 'react';

interface NumberInputProps {
    label: string;
    value: number;
    onChange: (newValue: number) => void;
    disabled?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, disabled = false }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(parseFloat(e.target.value));
    };

    return (
        <div style={styles.container}>
            <label style={styles.label}>{label}</label>
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
    label: {
        color: '#ccc',
        marginRight: '1rem',
        fontSize: '0.85rem',
        textTransform: 'capitalize',
    },
    input: {
        width: '60px',
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