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

    const handleExportDb = () => {
        try {
            const dbState = localStorage.getItem('gameforge-db-simulation');
            if (!dbState) {
                alert('No database found in local storage.');
                return;
            }
            const blob = new Blob([dbState], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gameforge-db-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export database:', error);
            alert('An error occurred during database export.');
        }
    };

    const handleImportDb = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result;
                    if (typeof content !== 'string') throw new Error('File content is not readable.');
                    
                    const parsedContent = JSON.parse(content);
                    if (!parsedContent.users || !parsedContent.roles || !parsedContent.modules) {
                        throw new Error('Invalid database file structure. Make sure it is a valid backup file.');
                    }

                    localStorage.setItem('gameforge-db-simulation', content);
                    alert('Database imported successfully. The application will now reload to apply the changes.');
                    window.location.reload();
                } catch (error) {
                    console.error('Failed to import database:', error);
                    alert(`Failed to import database file: ${(error as Error).message}`);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

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
                    <button onClick={handleExportDb} style={styles.debugButton}>
                        Export DB
                    </button>
                    <button onClick={handleImportDb} style={styles.debugButton}>
                        Import DB
                    </button>
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