import React from 'react';
import TabSystem, { Tab } from './TabSystem';
import LibraryPanel from './LibraryPanel';
import AssetPanel from './AssetPanel';
import NodeLibraryPanel from './graph/NodeLibraryPanel';

const LeftSidebar: React.FC = () => {
    
    const tabs: Tab[] = [
        {
            label: 'Library',
            content: <LibraryPanel />
        },
        {
            label: 'Nodes',
            content: <NodeLibraryPanel />
        },
        {
            label: 'Assets',
            content: <AssetPanel />
        }
    ];
    
    return (
        <div style={styles.sidebarContainer}>
            <TabSystem tabs={tabs} />
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