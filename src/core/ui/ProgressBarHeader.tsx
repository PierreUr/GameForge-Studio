import React, { useState, useEffect } from 'react';

interface ProgressData {
    totalTasks: number;
    completedTasks: number;
    testLog: string[];
}

const ProgressBarHeader: React.FC = () => {
    const [progressData, setProgressData] = useState<ProgressData | null>(null);
    const [isLogVisible, setIsLogVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // The user specified the path /js/progress.json
                const response = await fetch('/js/progress.json', { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: ProgressData = await response.json();
                setProgressData(data);
                setError(null);
            } catch (e) {
                console.error("Failed to fetch progress data:", e);
                setError("Could not load progress data.");
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 2000); // Poll every 2 seconds

        return () => clearInterval(intervalId);
    }, []);

    const progressPercentage = progressData && progressData.totalTasks > 0
        ? (progressData.completedTasks / progressData.totalTasks) * 100
        : 0;
        
    const progressText = progressData
        ? `${progressData.completedTasks} / ${progressData.totalTasks} (${Math.round(progressPercentage)}%)`
        : 'Loading...';

    return (
        <header style={styles.headerContainer}>
            <div style={styles.progressBarWrapper}>
                <span style={styles.progressLabel}>Project Progress:</span>
                <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${progressPercentage}%`}}></div>
                </div>
                <span style={styles.progressText}>{error || progressText}</span>
            </div>
            {progressData && (
                <button onClick={() => setIsLogVisible(!isLogVisible)} style={styles.logButton}>
                    {isLogVisible ? 'Hide Log' : 'Show Log'}
                </button>
            )}
            {isLogVisible && progressData && (
                <div style={styles.logContainer}>
                    <pre style={styles.logContent}>
                        {progressData.testLog.slice().reverse().join('\n')}
                    </pre>
                </div>
            )}
        </header>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    headerContainer: {
        backgroundColor: '#2a2a2a',
        color: '#d4d4d4',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid #444',
        flexShrink: 0,
        position: 'relative',
        zIndex: 100
    },
    progressBarWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    progressLabel: {
        fontSize: '0.9rem',
        whiteSpace: 'nowrap',
    },
    progressBar: {
        flex: 1,
        height: '20px',
        backgroundColor: '#555',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid #333'
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007acc',
        transition: 'width 0.5s ease-in-out',
    },
    progressText: {
        fontSize: '0.9rem',
        minWidth: '120px',
        textAlign: 'right',
    },
    logButton: {
        position: 'absolute',
        top: '0.5rem',
        right: '1rem',
        backgroundColor: '#555',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.2rem 0.8rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        marginLeft: '1rem',
    },
    logContainer: {
        marginTop: '0.5rem',
        maxHeight: '200px',
        overflowY: 'auto',
        backgroundColor: '#1e1e1e',
        border: '1px solid #444',
        borderRadius: '4px',
    },
    logContent: {
        padding: '0.5rem',
        margin: 0,
        fontSize: '0.8rem',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace'
    }
};

export default ProgressBarHeader;
