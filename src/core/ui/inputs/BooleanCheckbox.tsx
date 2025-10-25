import React from 'react';

interface BooleanCheckboxProps {
    label: string;
    value: boolean;
    onChange: (newValue: boolean) => void;
}

const BooleanCheckbox: React.FC<BooleanCheckboxProps> = ({ label, value, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
    };

    return (
        <div style={styles.container}>
            <label style={styles.label}>{label}</label>
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
    label: {
        color: '#ccc',
        marginRight: '1rem',
        fontSize: '0.85rem',
        textTransform: 'capitalize',
    },
    checkbox: {
        cursor: 'pointer',
    }
};

export default BooleanCheckbox;
