import React from 'react';

interface TestChecklistProps {
    todoContent: string;
    onRunTest: (slug: string, taskName: string) => void;
    onRunAllTests: () => void;
    testStatuses: Record<string, 'success' | 'failure'>;
}

const slugifyTaskName = (text: string): string => {
    const idMatch = text.match(/\*\*\[(\d+)\]\*\*/);
    if (!idMatch) return '';

    const id = idMatch[1].padStart(3, '0');
    let title = text.replace(/\*\*\[\d+\]\*\*\s*/, '').split(' -> ')[0].trim();
    
    title = title.toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^\w\s-]/g, ' ') // Replace special characters with a space
        .replace(/\s+/g, '-')       // Replace spaces with -
        .replace(/--+/g, '-')       // Replace multiple - with single -
        .replace(/^-+/, '')         // Trim - from start of text
        .replace(/-+$/, '');        // Trim - from end of text
    
    return `${id}-${title}`;
};


const TestChecklist: React.FC<TestChecklistProps> = ({ todoContent, onRunTest, onRunAllTests, testStatuses }) => {
    const completedTasks = todoContent
        .split('\n')
        .filter(line => line.trim().startsWith('- [x]'));

    return (
        <div style={styles.checklistContainer}>
            <div style={styles.checklistHeaderContainer}>
                <h4 style={styles.checklistHeader}>System Self-Test Checklist</h4>
                <button onClick={onRunAllTests} style={styles.runAllButton}>
                    Run All &amp; Get Report
                </button>
            </div>
            <ul style={styles.checklist}>
                {completedTasks.map((task, index) => {
                    const taskName = task.replace(/- \[x\] /, '').trim();
                    const taskSlug = slugifyTaskName(taskName);
                    const status = testStatuses[taskSlug];
                    return (
                        <li key={index} style={styles.checklistItem}>
                             {status && (
                                <span style={{ 
                                    ...styles.statusIcon, 
                                    color: status === 'success' ? '#4CAF50' : '#F44336' 
                                }}>
                                    {status === 'success' ? '✔' : '✖'}
                                </span>
                            )}
                            {!status && <span style={{...styles.statusIcon, color: '#666'}}>?</span>}
                            <span style={styles.taskName}>{taskName}</span>
                            <button 
                                onClick={() => onRunTest(taskSlug, taskName)}
                                style={styles.testButton}
                                aria-label={`Run test for ${taskName}`}
                            >
                                Run Test
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    checklistContainer: {
        width: '100%',
        marginTop: '1.5rem',
        borderTop: '1px solid #444',
        paddingTop: '1.5rem'
    },
    checklistHeaderContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    checklistHeader: {
        margin: 0
    },
    runAllButton: {
        backgroundColor: '#007acc',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    },
    checklist: {
        listStyle: 'none',
        margin: 0,
        maxHeight: '300px',
        overflowY: 'auto',
        backgroundColor: '#1e1e1e',
        border: '1px solid #444',
        borderRadius: '4px',
        padding: '1rem',
    },
    checklistItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 0',
        borderBottom: '1px solid #333',
        fontSize: '0.9rem',
    },
    statusIcon: {
        marginRight: '0.75rem',
        fontSize: '1.1rem',
        width: '20px',
        textAlign: 'center',
        flexShrink: 0,
    },
    taskName: {
        flex: 1,
        marginRight: '1rem',
    },
    testButton: {
        backgroundColor: '#555',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        marginLeft: '1rem',
        transition: 'background-color 0.2s'
    }
};

export default TestChecklist;