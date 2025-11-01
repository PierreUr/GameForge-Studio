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
    projectName: string;
    onProjectNameChange: (name: string) => void;
    isProjectLive: boolean;
    onIsProjectLiveChange: (isLive: boolean) => void;
    onHelpClick: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
    onSave, 
    onLoad, 
    onPreview, 
    onExportHTML, 
    onUndo, 
    onRedo, 
    onLogout,
    onAdminClick,
    projectName,
    onProjectNameChange,
    isProjectLive,
    onIsProjectLiveChange,
    onHelpClick,
}) => {
    const { user } = useAuth();
    const isAdmin = user?.roles.includes('ADMIN');
    const [isFileMenuOpen, setIsFileMenuOpen] = React.useState(false);
    const [isEditPopoverOpen, setIsEditPopoverOpen] = React.useState(false);
    const fileMenuRef = React.useRef<HTMLDivElement>(null);
    const editPopoverRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
                setIsFileMenuOpen(false);
            }
            if (editPopoverRef.current && !editPopoverRef.current.contains(event.target as Node)) {
                setIsEditPopoverOpen(false);
            }
        };

        if (isFileMenuOpen || isEditPopoverOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFileMenuOpen, isEditPopoverOpen]);
    
    const handleSaveAsClick = () => {
        onSave(); 
        setIsFileMenuOpen(false);
    };

    return (
        <div style={styles.toolbar}>
            <div ref={fileMenuRef} style={styles.fileMenuContainer}>
                <DebugIdTooltip debugId="toolbar-file-menu">
                    <button style={styles.button} onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}>
                        Datei
                    </button>
                </DebugIdTooltip>
                {isFileMenuOpen && (
                    <div style={styles.dropdownMenu}>
                        <button style={styles.dropdownItem} onClick={handleSaveAsClick}>
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
            <DebugIdTooltip debugId="toolbar-undo">
                <button style={{...styles.button, ...styles.iconButton}} onClick={onUndo} aria-label="Undo">↺</button>
            </DebugIdTooltip>
            <DebugIdTooltip debugId="toolbar-redo">
                <button style={{...styles.button, ...styles.iconButton}} onClick={onRedo} aria-label="Redo">↻</button>
            </DebugIdTooltip>
            <DebugIdTooltip debugId="toolbar-save">
                <button style={{...styles.button, ...styles.iconButton}} onClick={onSave} aria-label="Save Project">💾</button>
            </DebugIdTooltip>
            
            <div style={styles.spacer}>
                <div style={styles.projectInfoContainer}>
                    <span 
                        style={{...styles.statusIndicator, backgroundColor: isProjectLive ? '#4CAF50' : '#666'}}
                        title={isProjectLive ? 'Project is Live' : 'Project is not Live'}
                    />
                    <span style={styles.projectNameDisplay}>{projectName}</span>
                    <button 
                        style={styles.editButton} 
                        onClick={(e) => { e.stopPropagation(); setIsEditPopoverOpen(true); }}
                        aria-label="Edit project name and status"
                    >
                        ✏️
                    </button>
                </div>
                {isEditPopoverOpen && (
                    <div ref={editPopoverRef} style={styles.editPopover}>
                        <h5 style={styles.popoverTitle}>Edit Project</h5>
                        <label style={styles.popoverLabel}>Project Name</label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => onProjectNameChange(e.target.value)}
                            style={styles.projectNameInput}
                        />
                        <label style={styles.popoverCheckboxLabel}>
                            <input 
                                type="checkbox"
                                checked={isProjectLive}
                                onChange={(e) => onIsProjectLiveChange(e.target.checked)}
                            />
                            Set Project Live
                        </label>
                        <button style={styles.popoverButton} onClick={() => setIsEditPopoverOpen(false)}>Done</button>
                    </div>
                )}
            </div>

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

            <DebugIdTooltip debugId="toolbar-help">
                <button style={{...styles.button, ...styles.helpButton}} onClick={onHelpClick} aria-label="Open Help Manual">?</button>
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
        gap: '0.75rem',
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
    iconButton: {
        padding: '0.5rem',
        width: '40px',
        fontSize: '1.2rem',
        lineHeight: 1,
    },
    helpButton: {
        backgroundColor: '#007acc',
        color: 'white',
        border: '1px solid #005a99',
        borderRadius: '50%',
        width: '26px',
        height: '26px',
        padding: 0,
        fontSize: '1rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
    },
    divider: {
        width: '1px',
        height: '24px',
        backgroundColor: '#444',
    },
    spacer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    projectInfoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: '#2a2a2a',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        border: '1px solid #555',
    },
    statusIndicator: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        border: '1px solid #222',
    },
    projectNameDisplay: {
        color: '#eee',
        fontSize: '0.9rem',
        maxWidth: '300px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    editButton: {
        background: 'none',
        border: 'none',
        color: '#aaa',
        cursor: 'pointer',
        fontSize: '1rem',
        padding: '0.25rem',
        lineHeight: 1,
    },
    editPopover: {
        position: 'absolute',
        top: 'calc(100% + 10px)',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#3a3a3a',
        borderRadius: '6px',
        border: '1px solid #555',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 110,
        padding: '1rem',
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    popoverTitle: {
        margin: '0 0 0.5rem 0',
        fontSize: '1rem',
        color: '#eee',
        borderBottom: '1px solid #555',
        paddingBottom: '0.5rem',
    },
    popoverLabel: {
        fontSize: '0.8rem',
        color: '#aaa',
        marginBottom: '-0.5rem',
    },
    popoverCheckboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
        color: '#ccc',
    },
    projectNameInput: {
        backgroundColor: '#2a2a2a',
        color: '#eee',
        border: '1px solid #555',
        borderRadius: '4px',
        padding: '0.5rem',
        fontSize: '0.9rem',
        width: '100%',
        boxSizing: 'border-box',
    },
    popoverButton: {
        backgroundColor: '#007acc',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '0.5rem',
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