import React from 'react';

interface TextInputProps {
    label: string;
    value: string;
    onChange: (newValue: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div style={styles.container}>
            <label style={styles.label}>{label}</label>
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
    label: {
        color: '#ccc',
        marginRight: '1rem',
        fontSize: '0.85rem',
        textTransform: 'capitalize',
    },
    input: {
        width: '120px',
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
