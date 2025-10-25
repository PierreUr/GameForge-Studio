import React from 'react';

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (newValue: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div style={styles.container}>
            <label style={styles.label}>{label}</label>
            <input
                type="color"
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
        height: '24px',
        backgroundColor: 'transparent',
        border: '1px solid #555',
        borderRadius: '3px',
        padding: '0.1rem',
        cursor: 'pointer',
    }
};

export default ColorPicker;
