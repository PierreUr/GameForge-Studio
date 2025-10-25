import React from 'react';

const AssetPanel: React.FC = () => {
    return (
        <div style={styles.panelContainer}>
            <h5 style={styles.header}>Asset Management</h5>
            <div style={styles.content}>
                <p>Placeholder for asset uploading and management (images, audio, etc.).</p>
                <button style={styles.button}>Upload Asset</button>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    panelContainer: {
        padding: '1rem',
        height: '100%',
        overflowY: 'auto',
        color: '#ccc'
    },
    header: {
        margin: '0 0 1rem 0',
        color: '#eee',
        borderBottom: '1px solid #444',
        paddingBottom: '0.5rem',
        fontSize: '1rem'
    },
    content: {
        fontSize: '0.9rem',
        color: '#999',
    },
    button: {
        backgroundColor: '#555',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        marginTop: '1rem'
    }
};

export default AssetPanel;
