import React, { useState, ReactNode } from 'react';
import DebugIdTooltip from './dev/DebugIdTooltip';

// FIX: Exported Tab interface so it can be used by parent components.
export interface Tab {
    label: string;
    content: ReactNode;
}

interface TabSystemProps {
    tabs: Tab[];
    // FIX: Added an onTabChange callback prop to notify parent components of tab selection.
    onTabChange?: (tab: Tab, index: number) => void;
}

const TabSystem: React.FC<TabSystemProps> = ({ tabs, onTabChange }) => {
    const [activeTab, setActiveTab] = useState(0);

    if (!tabs || tabs.length === 0) {
        return null;
    }

    // FIX: Created a handler to manage tab state and call the onTabChange callback.
    const handleTabClick = (index: number) => {
        setActiveTab(index);
        if (onTabChange) {
            onTabChange(tabs[index], index);
        }
    };

    return (
        <DebugIdTooltip debugId="tab-system-container">
            <div style={styles.tabContainer}>
                <div style={styles.tabHeader} role="tablist">
                    {tabs.map((tab, index) => {
                        const tabId = `tab-${tab.label.toLowerCase().replace(/\s+/g, '-')}`;
                        return (
                            <DebugIdTooltip key={index} debugId={tabId}>
                                <button
                                    onClick={() => handleTabClick(index)}
                                    style={index === activeTab ? { ...styles.tabButton, ...styles.activeTabButton } : styles.tabButton}
                                    role="tab"
                                    aria-selected={index === activeTab}
                                >
                                    {tab.label}
                                </button>
                            </DebugIdTooltip>
                        );
                    })}
                </div>
                <div style={styles.tabContent} role="tabpanel">
                    {tabs[activeTab].content}
                </div>
            </div>
        </DebugIdTooltip>
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
        width: '100%', // Ensure the wrapper fills the space
    },
    activeTabButton: {
        color: '#fff',
        borderBottom: '2px solid #007acc',
    },
    tabContent: {
        flex: 1,
        overflowY: 'auto', // FIX: Changed from 'hidden' to 'auto' to allow scrolling
        position: 'relative'
    },
};

export default TabSystem;