import React from 'react';
import TabSystem, { Tab } from './TabSystem';
import LibraryPanel from './LibraryPanel';
import AssetPanel from './AssetPanel';
import { useAuth } from '../auth/AuthContext';

interface LeftSidebarProps {
    onViewChange: (viewId: 'canvas' | 'logic-graph' | 'admin' | 'ui-editor') => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onViewChange }) => {
    const { user } = useAuth();
    
    const tabs: Tab[] = [
        {
            label: 'Library',
            content: <LibraryPanel />
        },
        {
            label: 'Layers',
            content: <div style={styles.panelContent}><p>Placeholder for scene layers.</p></div>
        },
        {
            label: 'UI Editor',
            content: <div style={styles.panelContent}><p>UI Editor is active in the main view.</p></div>
        },
        {
            label: 'Logic Graph',
            content: <div style={styles.panelContent}><p>Logic Graph editor is active in the main view.</p></div>
        },
        {
            label: 'Assets',
            content: <AssetPanel />
        }
    ];

    const handleTabChange = (tab: Tab) => {
        if (tab.label === 'Logic Graph') {
            onViewChange('logic-graph');
        } else if (tab.label === 'UI Editor') {
            onViewChange('ui-editor');
        }
    };
    
    return (
        <div style={styles.sidebarContainer}>
            <TabSystem tabs={tabs} onTabChange={handleTabChange} />
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    sidebarContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#252526',
    },
    panelContent: {
        padding: '1rem',
        fontSize: '0.9rem',
        color: '#999',
        height: '100%',
        overflowY: 'auto'
    },
};

export default LeftSidebar;