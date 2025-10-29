import React, { useState, useEffect } from 'react';
import { User } from '../../../server/types';
import { UsersService } from '../../auth/UsersService';

const UserManagementPanel: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const userList = await UsersService.getAllUsers();
                setUsers(userList);
            } catch (err) {
                setError('Failed to fetch users.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Placeholder for Edit User Modal
    const handleEditUser = (user: User) => {
        alert(`Editing user: ${user.email}. (Modal not yet implemented)`);
    };

    return (
        <div style={styles.container}>
            <h4>User Management</h4>
            {isLoading && <p>Loading users...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!isLoading && !error && (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Roles</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td style={styles.td}>{user.id}</td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>{user.roles.join(', ')}</td>
                                <td style={styles.td}>
                                    <button onClick={() => handleEditUser(user)} style={styles.actionButton}>
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '1rem' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    th: {
        borderBottom: '1px solid #444',
        padding: '0.75rem',
        textAlign: 'left',
        backgroundColor: '#3a3a3a',
    },
    td: { borderBottom: '1px solid #444', padding: '0.75rem' },
    actionButton: {
        backgroundColor: '#555',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default UserManagementPanel;
