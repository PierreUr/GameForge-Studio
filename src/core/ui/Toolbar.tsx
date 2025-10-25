import React from 'react';
import DebugIdTooltip from './dev/DebugIdTooltip';

interface ToolbarProps {
    onSave: () => void;
    onLoad: () => void;
    onPreview: () => void;
    onToggleColliders: () => void;
    onExportHTML: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onOpenAdminPanel: () => void;
    onOpenSettingsPanel: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onSave, onLoad, onPreview, onToggleColliders, onExportHTML, onUndo, onRedo, onOpenAdminPanel, onOpenSettingsPanel }) => {
    
    return (
        <div style={styles.toolbar}>
            <DebugIdTooltip debugId="toolbar-undo">
                <button style={styles.button} onClick={onUndo}>Undo</button>
            </DebugIdTooltip>
            <DebugIdTooltip debugId="toolbar-redo">
                <button style={styles.button} onClick={onRedo}>Redo</button>
            </DebugIdTooltip>
            <div style={styles.divider}></div>
            <DebugIdTooltip debugId="toolbar-save">
                <button style={styles.button} onClick={onSave}>Save Project</button>
            </DebugIdTooltip>
            <DebugIdTooltip debugId="toolbar-load">
                <button style={styles.button} onClick={onLoad}>Load Project</button>
            </DebugIdTooltip>
            <DebugIdTooltip debugId="toolbar-export-html">
                <button style={styles.button} onClick={onExportHTML}>Export HTML</button>
            </DebugIdTooltip>
            <div style={styles.divider}></div>
            <DebugIdTooltip debugId="toolbar-toggle-colliders">
                <button style={styles.button} onClick={onToggleColliders}>Toggle Colliders</button>
            </DebugIdTooltip>
            <DebugIdTooltip debugId="toolbar-settings">
                <button style={styles.button} onClick={onOpenSettingsPanel}>Settings</button>
            </DebugIdTooltip>
            <DebugIdTooltip debugId="toolbar-admin-panel">
                <button style={styles.button} onClick={onOpenAdminPanel}>Admin Panel</button>
            </DebugIdTooltip>
            <DebugIdTooltip debugId="toolbar-live-preview">
                <button style={{...styles.button, ...styles.previewButton}} onClick={onPreview}>Live Preview</button>
            </DebugIdTooltip>
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