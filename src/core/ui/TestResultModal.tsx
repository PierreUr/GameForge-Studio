import React, { useState } from 'react';

interface TestResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: string;
}

const TestResultModal: React.FC<TestResultModalProps> = ({ isOpen, onClose, results }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy Results');

    if (!isOpen) {
        return null;
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(results).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy Results'), 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            setCopyButtonText('Failed to copy');
            setTimeout(() => setCopyButtonText('Copy Results'), 2000);
        });
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3 style={styles.header}>Test Execution Report</h3>
                <pre style={styles.resultsContent}>{results}</pre>
                <div style={styles.footer}>
                    <button onClick={handleCopy} style={styles.button}>
                        {copyButtonText}
                    </button>
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
    },
    header: {
        marginTop: 0,
        borderBottom: '1px solid #444',
        paddingBottom: '1rem',
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
    },
    button: {
        backgroundColor: '#555',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        marginLeft: '1rem',
        transition: 'background-color 0.2s'
    },
    closeButton: {
        backgroundColor: '#444'
    }
};

export default TestResultModal;
