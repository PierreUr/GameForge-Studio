import React, { useState, useCallback } from 'react';
import { useDebugContext } from './DebugContext';

interface AdminPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onRunTests: () => Promise<string>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onRunTests }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState('');
    const { toggleDebugVisibility } = useDebugContext();

    const handleRunTests = useCallback(async () => {
        setIsLoading(true);
        setResults('Running tests...');
        try {
            const testResults = await onRunTests();
            setResults(testResults || 'No tests were found or executed.');
        } catch (error) {
            setResults(`An error occurred while running tests:\n${(error as Error).message}`);
        }
        setIsLoading(false);
    }, [onRunTests]);

    if (!isOpen) {
        return null;
    }

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3 style={styles.header}>Admin Panel - Developer Tools</h3>
                <div style={styles.content}>
                    <div style={styles.buttonGroup}>
                        <button onClick={handleRunTests} disabled={isLoading} style={styles.button}>
                            {isLoading ? 'Running...' : 'Run All System Tests'}
                        </button>
                        <button onClick={toggleDebugVisibility} style={styles.button}>
                            Toggle Debug IDs
                        </button>
                    </div>
                    {results && (
                        <pre style={styles.resultsContent}>{results}</pre>
                    )}
                </div>
                <div style={styles.footer}>
                    <button onClick={onClose} style={{...styles.button, ...styles.closeButton}}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#2a2a2a',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #444',
        width: '80%',
        maxWidth: '800px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
    },
    header: {
        marginTop: 0,
        borderBottom: '1px solid #444',
        paddingBottom: '1rem',
        color: '#eee',
    },
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
    },
    resultsContent: {
        backgroundColor: '#1e1e1e',
        border: '1px solid #444',
        borderRadius: '4px',
        padding: '1rem',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        fontSize: '0.85rem',
        color: '#d4d4d4',
        flex: 1,
        overflowY: 'auto',
    },
    footer: {
        marginTop: '1.5rem',
        display: 'flex',
        justifyContent: 'flex-end',
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
        transition: 'background-color 0.2s',
    },
    closeButton: {
        backgroundColor: '#444',
        marginLeft: '1rem',
    }
};

export default AdminPanel;