import React, { useState, useCallback } from 'react';

interface SystemTestPanelProps {
    onRunTests: () => Promise<string>;
}

const SystemTestPanel: React.FC<SystemTestPanelProps> = ({ onRunTests }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState('');
    const [copyButtonText, setCopyButtonText] = useState('Copy Results');

    const handleRunTests = useCallback(async () => {
        setIsLoading(true);
        setResults('Running tests...');
        setCopyButtonText('Copy Results');
        try {
            const testResults = await onRunTests();
            setResults(testResults || 'No tests were found or executed.');
        } catch (error) {
            setResults(`An error occurred while running tests:\n${(error as Error).message}`);
        }
        setIsLoading(false);
    }, [onRunTests]);

    const handleCopy = () => {
        if (!results) return;
        navigator.clipboard.writeText(results).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy Results'), 2000);
        }).catch(err => {
            console.error('Failed to copy results:', err);
            alert('Failed to copy results to clipboard.');
        });
    };

    return (
        <div style={styles.container}>
            <h4>System Self-Tests</h4>
            <div style={styles.buttonGroup}>
                <button onClick={handleRunTests} disabled={isLoading} style={styles.button}>
                    {isLoading ? 'Running...' : 'Run All System Tests'}
                </button>
                {results && (
                    <button onClick={handleCopy} style={styles.button}>
                        {copyButtonText}
                    </button>
                )}
            </div>
            {results && (
                <pre style={styles.resultsContent}>{results}</pre>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%' },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        alignSelf: 'flex-start',
        marginBottom: '1rem',
    },
    button: {
        backgroundColor: '#555',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
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
};

export default SystemTestPanel;