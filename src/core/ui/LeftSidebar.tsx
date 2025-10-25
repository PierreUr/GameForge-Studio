import React from 'react';
import TabSystem from './TabSystem';
import LibraryPanel from './LibraryPanel';
import LogicGraphPanel from './LogicGraphPanel';
import AssetPanel from './AssetPanel';

const LeftSidebar: React.FC = () => {
    
    const tabs = [
        {
            label: 'Library',
            content: <LibraryPanel />
        },
        {
            label: 'Layers',
            content: <div style={styles.panelContent}><p>Placeholder for scene layers.</p></div>
        },
        {
            label: 'Logic Graph',
            content: <LogicGraphPanel />
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