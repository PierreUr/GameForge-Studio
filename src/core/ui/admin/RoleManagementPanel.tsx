import React, { useState, useEffect } from 'react';
import { Role } from '../../../server/types';
import { RolesService } from '../../auth/RolesService';

const RoleManagementPanel: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newRoleName, setNewRoleName] = useState('');

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const roleList = await RolesService.getAllRoles();
            setRoles(roleList);
        } catch (err) {
            setError('Failed to fetch roles.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchRoles();
    }, []);

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;
        try {
            await RolesService.createRole(newRoleName.trim(), []);
            setNewRoleName('');
            fetchRoles(); // Re-fetch roles to show the new one
        } catch (err) {
            alert((err as Error).message);
        }
    };

    return (
        <div style={styles.container}>
            <h4>Role Management</h4>
            <form onSubmit={handleCreateRole} style={styles.form}>
                <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="New role name"
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Create Role</button>
            </form>
            {isLoading && <p>Loading roles...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!isLoading && !error && (
                <ul style={styles.list}>
                    {roles.map(role => (
                        <li key={role.id} style={styles.listItem}>
                            <span>{role.name}</span>
                            <small>Permissions: {role.permissions.join(', ') || 'None'}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '1rem' },
    form: { display: 'flex', gap: '1rem', marginBottom: '1rem' },
    input: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        color: '#eee',
        border: '1px solid #555',
        borderRadius: '3px',
        padding: '0.5rem',
    },
    button: {
        backgroundColor: '#007acc',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    list: { listStyle: 'none', padding: 0, margin: 0 },
    listItem: {
        backgroundColor: '#3a3a3a',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '0.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
};

export default RoleManagementPanel;
