import React, { useState, ReactNode } from 'react';
import DebugIdTooltip from './dev/DebugIdTooltip';

// FIX: Exported Tab interface so it can be used by parent components.
// FIX: Updated `label` to be `ReactNode` to support complex components in tab headers. Added `id` for stable keys.
export interface Tab {
    label: ReactNode;
    content: ReactNode;
    id?: string;
    onClose?: () => void;
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
                        // FIX: Use the optional `id` or fallback to a string representation for generating a stable debug ID.
                        const tabIdentifier = tab.id || (typeof tab.label === 'string' ? tab.label : index.toString());
                        const tabId = `tab-${tabIdentifier.toLowerCase().replace(/\s+/g, '-')}`;
                        const isActive = index === activeTab;
                        
                        const buttonStyle = {
                            ...styles.tabButton,
                            ...(isActive ? styles.activeTabButton : {}),
                            ...(tab.onClose ? { paddingRight: '2rem' } : {})
                        };

                        return (
                            <DebugIdTooltip key={tabIdentifier} debugId={tabId}>
                                <button
                                    onClick={() => handleTabClick(index)}
                                    style={buttonStyle}
                                    role="tab"
                                    aria-selected={isActive}
                                >
                                    {tab.label}
                                    {tab.onClose && (
                                        <span
                                            style={styles.closeButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                tab.onClose?.();
                                            }}
                                            title="Close tab"
                                        >
                                            &times;
                                        </span>
                                    )}
                                </button>
                            </DebugIdTooltip>
                        );
                    })}
                </div>
                <div style={styles.tabContent} role="tabpanel">
                    {tabs[activeTab]?.content}
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
        flex: 1, // Allow it to grow in a flex container
        minWidth: 0, // Allow it to shrink
    },
    tabHeader: {
        display: 'flex',
        flexShrink: 0,
        borderBottom: '1px solid #444',
        backgroundColor: '#333',
        padding: '0.25rem 0.5rem 0 0.5rem',
        gap: '4px',
    },
    tabButton: {
        padding: '0.6rem 1rem',
        cursor: 'pointer',
        backgroundColor: '#3e3e42',
        border: '1px solid #555',
        borderBottom: 'none',
        color: '#ccc',
        fontSize: '0.9rem',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        position: 'relative',
    },
    activeTabButton: {
        backgroundColor: '#252526',
        color: '#fff',
        border: '1px solid #444',
        borderBottom: '1px solid #252526',
        position: 'relative',
        top: '1px',
        zIndex: 1,
    },
    tabContent: {
        flex: 1,
        overflowY: 'auto',
        position: 'relative',
        backgroundColor: '#252526', // Ensure content background matches active tab
        minHeight: 0,
    },
    closeButton: {
        position: 'absolute',
        top: '50%',
        right: '8px',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: '#aaa',
        cursor: 'pointer',
        fontSize: '1.2rem',
        lineHeight: 1,
        padding: '2px 4px',
        borderRadius: '50%',
    }
};

export default TabSystem;