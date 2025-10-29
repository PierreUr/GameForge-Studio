import React, { useState, useCallback } from 'react';
import { testRegistry } from '../../dev/tests';
import TestResultModal from '../TestResultModal';

interface SystemTestPanelProps {
    onRunTests: (slug?: string) => Promise<string>;
}

type TestStatus = 'idle' | 'running' | 'success' | 'failure';

const formatSlug = (slug: string): string => {
    return slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};

const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%' },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexShrink: 0,
    },
    runAllButton: {
        backgroundColor: '#007acc',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    testListContainer: {
        flex: 1,
        overflowY: 'auto',
        backgroundColor: '#1e1e1e',
        border: '1px solid #444',
        borderRadius: '4px',
    },
    testList: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
    },
    testItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #333',
        gap: '1rem',
    },
    statusIcon: {
        width: '20px',
        textAlign: 'center',
        fontSize: '1.2rem',
        flexShrink: 0,
    },
    testName: {
        flex: 1,
    },
    infoIconContainer: {
        position: 'relative',
        cursor: 'help',
    },
    infoIcon: {
        color: '#666',
    },
    tooltip: {
        visibility: 'hidden',
        width: '250px',
        backgroundColor: '#111',
        color: '#fff',
        textAlign: 'center',
        borderRadius: '6px',
        padding: '8px',
        position: 'absolute',
        zIndex: 1,
        bottom: '125%',
        right: '50%',
        marginLeft: '-125px',
        opacity: 0,
        transition: 'opacity 0.3s',
        border: '1px solid #555',
        fontSize: '0.8rem',
    },
    runButton: {
        backgroundColor: '#555',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

// A small sub-component to handle the tooltip properly with state
const InfoTooltip: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    
    const tooltipDynamicStyle: React.CSSProperties = {
        ...styles.tooltip,
        visibility: isHovered ? 'visible' : 'hidden',
        opacity: isHovered ? 1 : 0,
    };

    return (
        <div 
            style={styles.infoIconContainer}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span style={styles.infoIcon}>ⓘ</span>
            <div style={tooltipDynamicStyle}>
                Expected: Produces [SUCCESS] log for correct implementation and [FAILURE] log for simulated error handling.
            </div>
        </div>
    );
};

const SystemTestPanel: React.FC<SystemTestPanelProps> = ({ onRunTests }) => {
    const testSlugs = Object.keys(testRegistry);
    const initialStatuses = testSlugs.reduce((acc, slug) => {
        acc[slug] = 'idle';
        return acc;
    }, {} as Record<string, TestStatus>);

    const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>(initialStatuses);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const [isRunAllLoading, setIsRunAllLoading] = useState(false);

    const handleRunSingleTest = useCallback(async (slug: string) => {
        setTestStatuses(prev => ({ ...prev, [slug]: 'running' }));
        const resultLog = await onRunTests(slug);
        const hasError = resultLog.includes('[ERROR]') || resultLog.includes('[CRITICAL]');
        setTestStatuses(prev => ({ ...prev, [slug]: hasError ? 'failure' : 'success' }));
        setModalContent(resultLog);
        setIsModalOpen(true);
    }, [onRunTests]);

    const handleRunAllTests = useCallback(async () => {
        setIsRunAllLoading(true);
        let fullLog = `--- EXECUTING ALL ${testSlugs.length} TESTS ---\n\n`;
        for (const slug of testSlugs) {
            setTestStatuses(prev => ({ ...prev, [slug]: 'running' }));
            const resultLog = await onRunTests(slug);
            const hasError = resultLog.includes('[ERROR]') || resultLog.includes('[CRITICAL]');
            setTestStatuses(prev => ({ ...prev, [slug]: hasError ? 'failure' : 'success' }));
            fullLog += `--- Test: ${slug} ---\n`;
            fullLog += resultLog + '\n\n';
        }
        setIsRunAllLoading(false);
        setModalContent(fullLog);
        setIsModalOpen(true);
    }, [onRunTests, testSlugs]);
    
    const getStatusIcon = (status: TestStatus) => {
        switch (status) {
            case 'success': return <span style={{ color: '#4CAF50' }}>✔</span>;
            case 'failure': return <span style={{ color: '#F44336' }}>✖</span>;
            case 'running': return <span style={{ color: '#007acc' }}>…</span>;
            case 'idle': return <span style={{ color: '#666' }}>-</span>;
            default: return null;
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h4>System Self-Tests</h4>
                <button onClick={handleRunAllTests} disabled={isRunAllLoading} style={styles.runAllButton}>
                    {isRunAllLoading ? 'Running All...' : 'Run All Sequentially'}
                </button>
            </div>
            
            <div style={styles.testListContainer}>
                <ul style={styles.testList}>
                    {testSlugs.map(slug => (
                        <li key={slug} style={styles.testItem}>
                            <div style={styles.statusIcon}>{getStatusIcon(testStatuses[slug])}</div>
                            <span style={styles.testName}>{formatSlug(slug)}</span>
                            {/* FIX: Replaced non-functional tooltip with a working state-based component. */}
                            <InfoTooltip />
                            <button 
                                onClick={() => handleRunSingleTest(slug)} 
                                disabled={testStatuses[slug] === 'running' || isRunAllLoading}
                                style={styles.runButton}
                            >
                                Run Test
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <TestResultModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                results={modalContent}
            />
        </div>
    );
};

export default SystemTestPanel;
