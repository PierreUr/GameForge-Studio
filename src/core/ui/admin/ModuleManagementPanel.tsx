import React, { useState, useEffect, useCallback } from 'react';
import { Module } from '../../../server/types';
import { ModulesService } from '../../auth/ModulesService';

const ModuleManagementPanel: React.FC = () => {
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formState, setFormState] = useState({ name: '', version: '', description: '' });

    const fetchModules = useCallback(async () => {
        setIsLoading(true);
        try {
            const moduleList = await ModulesService.getAllModules();
            setModules(moduleList);
        } catch (err) {
            setError('Failed to fetch modules.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.name || !formState.version) {
            alert('Name and version are required.');
            return;
        }
        try {
            await ModulesService.createModule({ ...formState, isActive: false, configSchema: {} });
            setFormState({ name: '', version: '', description: '' });
            fetchModules();
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleDeleteModule = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this module?')) {
            await ModulesService.deleteModule(id);
            fetchModules();
        }
    };

    const handleToggleActive = async (module: Module) => {
        await ModulesService.updateModule(module.id, { isActive: !module.isActive });
        fetchModules();
    };

    return (
        <div style={styles.container}>
            <h4>Module Management (Super Admin)</h4>
            
            <form onSubmit={handleCreateModule} style={styles.form}>
                <input name="name" value={formState.name} onChange={handleInputChange} placeholder="Module Name" style={styles.input} />
                <input name="version" value={formState.version} onChange={handleInputChange} placeholder="Version (e.g., 1.0.0)" style={styles.input} />
                <input name="description" value={formState.description} onChange={handleInputChange} placeholder="Description" style={{...styles.input, flex: 2}} />
                <button type="submit" style={styles.button}>Create Module</button>
            </form>

            {isLoading && <p>Loading modules...</p>}
            {error && <p style={{ color: '#ff8080' }}>{error}</p>}
            
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Version</th>
                        <th style={styles.th}>Description</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {modules.map(module => (
                        <tr key={module.id}>
                            <td style={styles.td}>{module.name}</td>
                            <td style={styles.td}>{module.version}</td>
                            <td style={styles.td}>{module.description}</td>
                            <td style={styles.td}>{module.isActive ? 'Active' : 'Inactive'}</td>
                            <td style={styles.td}>
                                <button onClick={() => handleToggleActive(module)} style={styles.actionButton}>Toggle Active</button>
                                <button onClick={() => handleDeleteModule(module.id)} style={{...styles.actionButton, ...styles.deleteButton}}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '1rem' },
    form: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' },
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
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    th: {
        borderBottom: '1px solid #444',
        padding: '0.75rem',
        textAlign: 'left',
        backgroundColor: '#3a3a3a',
    },
    td: { borderBottom: '1px solid #444', padding: '0.75rem', verticalAlign: 'middle' },
    actionButton: {
        backgroundColor: '#555',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '0.5rem',
    },
    deleteButton: {
        backgroundColor: '#9e2b25',
    },
};

export default ModuleManagementPanel;