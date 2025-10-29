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
    const [isFileMenuOpen, setIsFileMenuOpen] = React.useState(false);
    const fileMenuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
                setIsFileMenuOpen(false);
            }
        };

        if (isFileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFileMenuOpen]);
    
    return (
        <div style={styles.toolbar}>
            <DebugIdTooltip debugId="toolbar-undo">
                <button style={styles.button} onClick={onUndo}>Undo</button>
            </DebugIdTooltip>
            <DebugIdTooltip debugId="toolbar-redo">
                <button style={styles.button} onClick={onRedo}>Redo</button>
            </DebugIdTooltip>
            <div style={styles.divider}></div>
            <div ref={fileMenuRef} style={styles.fileMenuContainer}>
                <DebugIdTooltip debugId="toolbar-file-menu">
                    <button style={styles.button} onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}>
                        Datei
                    </button>
                </DebugIdTooltip>
                {isFileMenuOpen && (
                    <div style={styles.dropdownMenu}>
                        <button style={styles.dropdownItem} onClick={() => { onSave(); setIsFileMenuOpen(false); }}>
                            Save Project
                        </button>
                        <button style={styles.dropdownItem} onClick={() => { onLoad(); setIsFileMenuOpen(false); }}>
                            Load Project
                        </button>
                        <button style={styles.dropdownItem} onClick={() => { onExportHTML(); setIsFileMenuOpen(false); }}>
                            Export HTML
                        </button>
                    </div>
                )}
            </div>
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
    },
    fileMenuContainer: {
        position: 'relative',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 'calc(100% + 5px)',
        left: 0,
        backgroundColor: '#3a3a3a',
        borderRadius: '4px',
        border: '1px solid #555',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        zIndex: 100,
        padding: '0.5rem 0',
        minWidth: '180px',
        display: 'flex',
        flexDirection: 'column',
    },
    dropdownItem: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#eee',
        padding: '0.75rem 1rem',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '0.9rem',
    }
};

export default Toolbar;