import React from 'react';
import DebugIdTooltip from './dev/DebugIdTooltip';
import { useAuth } from '../auth/AuthContext';

interface ToolbarProps {
    onSave: () => void;
    onLoad: () => void;
    onPreview: () => void;
    onExportHTML: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onLogout: () => void;
    onAdminClick: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
    onSave, 
    onLoad, 
    onPreview, 
    onExportHTML, 
    onUndo, 
    onRedo, 
    onLogout,
    onAdminClick
}) => {
    const { user } = useAuth();
    const isAdmin = user?.roles.includes('ADMIN');
    
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
            <div style={styles.spacer}></div>
            <DebugIdTooltip debugId="toolbar-live-preview">
                <button style={{...styles.button, ...styles.previewButton}} onClick={onPreview}>Live Preview</button>
            </DebugIdTooltip>
            
            {isAdmin && (
                <DebugIdTooltip debugId="toolbar-admin-area">
                    <button style={styles.button} onClick={onAdminClick}>Admin Bereich</button>
                </DebugIdTooltip>
            )}

            <DebugIdTooltip debugId="toolbar-logout">
                <button style={styles.button} onClick={onLogout}>Logout</button>
            </DebugIdTooltip>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem 1rem',
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
    },
    spacer: {
        flex: 1,
    },
    previewButton: {
        backgroundColor: '#007acc',
    }
};

export default Toolbar;