import React, { useState, ReactNode } from 'react';

interface Tab {
    label: string;
    content: ReactNode;
}

interface TabSystemProps {
    tabs: Tab[];
}

const TabSystem: React.FC<TabSystemProps> = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(0);

    if (!tabs || tabs.length === 0) {
        return null;
    }

    return (
        <div style={styles.tabContainer}>
            <div style={styles.tabHeader} role="tablist">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        style={index === activeTab ? { ...styles.tabButton, ...styles.activeTabButton } : styles.tabButton}
                        role="tab"
                        aria-selected={index === activeTab}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div style={styles.tabContent} role="tabpanel">
                {tabs[activeTab].content}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    tabContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
    },
    tabHeader: {
        display: 'flex',
        flexShrink: 0,
        borderBottom: '1px solid #444',
        backgroundColor: '#333',
    },
    tabButton: {
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#ccc',
        fontSize: '0.9rem',
        borderBottom: '2px solid transparent',
        marginBottom: '-1px', // Align with the container border
    },
    activeTabButton: {
        color: '#fff',
        borderBottom: '2px solid #007acc',
    },
    tabContent: {
        flex: 1,
        overflow: 'hidden', // Let the child component handle its own scrolling
        position: 'relative'
    },
};

export default TabSystem;
