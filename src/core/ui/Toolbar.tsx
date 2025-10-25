import React from 'react';

interface ToolbarProps {
    onSave: () => void;
    onLoad: () => void;
    onPreview: () => void;
    onToggleGrid: () => void;
    onToggleColliders: () => void;
    onExportHTML: () => void;
    onUndo: () => void;
    onRedo: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onSave, onLoad, onPreview, onToggleGrid, onToggleColliders, onExportHTML, onUndo, onRedo }) => {
    return (
        <div style={styles.toolbar}>
            <button style={styles.button} onClick={onUndo}>Undo</button>
            <button style={styles.button} onClick={onRedo}>Redo</button>
            <div style={styles.divider}></div>
            <button style={styles.button} onClick={onSave}>Save Project</button>
            <button style={styles.button} onClick={onLoad}>Load Project</button>
            <button style={styles.button} onClick={onExportHTML}>Export HTML</button>
            <div style={styles.divider}></div>
            <button style={styles.button} onClick={onToggleGrid}>Toggle Grid</button>
            <button style={styles.button} onClick={onToggleColliders}>Toggle Colliders</button>
            <button style={{...styles.button, ...styles.previewButton}} onClick={onPreview}>Live Preview</button>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem 2rem',
        backgroundColor: '#333333',
        borderBottom: '1px solid #444',
        gap: '1rem',
        flexShrink: 0,
    },
    button: {
        backgroundColor: '#555',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'background-color 0.2s'
    },
    divider: {
        width: '1px',
        height: '24px',
        backgroundColor: '#444',
        margin: '0 0.5rem',
    },
    previewButton: {
        marginLeft: 'auto',
        backgroundColor: '#007acc',
    }
};

export default Toolbar;