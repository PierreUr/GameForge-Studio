import React from 'react';
import TabSystem from '../TabSystem';
import UserManagementPanel from './UserManagementPanel';
import RoleManagementPanel from './RoleManagementPanel';
import SystemTestPanel from './SystemTestPanel';
import { useDebugContext } from '../dev/DebugContext';
import { useAuth } from '../../auth/AuthContext';
import ModuleManagementPanel from './ModuleManagementPanel';

interface AdminDashboardProps {
    onRunTests: () => Promise<string>;
    onToggleColliders: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onRunTests, onToggleColliders }) => {
    const { toggleDebugVisibility } = useDebugContext();
    const { user } = useAuth();
    const isSuperAdmin = user?.roles.includes('SUPER_ADMIN');

    const tabs = [
        { label: 'Users', content: <UserManagementPanel /> },
        { label: 'Roles', content: <RoleManagementPanel /> },
        { label: 'System Tests', content: <SystemTestPanel onRunTests={onRunTests} /> },
    ];
    
    if (isSuperAdmin) {
        tabs.push({ label: 'Modules', content: <ModuleManagementPanel /> });
    }
    
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3>Admin Dashboard</h3>
                <div style={styles.buttonGroup}>
                    <button onClick={onToggleColliders} style={styles.debugButton}>
                        Toggle Colliders
                    </button>
                    <button onClick={toggleDebugVisibility} style={styles.debugButton}>
                        Toggle Debug IDs
                    </button>
                </div>
            </div>
            <TabSystem tabs={tabs} />
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#252526',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#333333',
        borderBottom: '1px solid #444',
    },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
    },
    debugButton: {
        backgroundColor: '#555',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default AdminDashboard;