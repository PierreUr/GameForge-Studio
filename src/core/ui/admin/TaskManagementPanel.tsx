import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../../../server/types';
import { TasksService } from '../../auth/TasksService';

const TaskManagementPanel: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        status: 'todo' as Task['status'],
        priority: 'none' as Task['priority'],
    });

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const taskList = await TasksService.getAllTasks();
            setTasks(taskList);
        } catch (err) {
            setError('Failed to fetch tasks.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.title.trim()) {
            alert('Title is required.');
            return;
        }
        try {
            const newTaskData: Omit<Task, 'id'> = {
                ...formState,
                isMilestone: false,
                assigneeIds: [],
                tagIds: [],
                dependencyIds: [],
                checklist: [],
            };
            await TasksService.createTask(newTaskData);
            setFormState({ title: '', description: '', status: 'todo', priority: 'none' });
            fetchTasks();
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleDeleteTask = async (id: number) => {
        console.log(`[TaskPanel] Attempting to delete task with ID: ${id}`);
        try {
            const wasDeleted = await TasksService.deleteTask(id);
            if (wasDeleted) {
                // Update the UI state directly for an immediate visual update.
                // This is more efficient than re-fetching and solves the update issue.
                setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
            } else {
                alert('Task could not be deleted. It may have already been removed.');
                fetchTasks(); // Re-sync if something unexpected happened.
            }
        } catch (error) {
            console.error(`Failed to delete task ${id}:`, error);
            alert('An error occurred while deleting the task.');
        }
    };

    return (
        <div style={styles.container}>
            <h4>Task Management</h4>
            
            <form onSubmit={handleCreateTask} style={styles.form}>
                <input name="title" value={formState.title} onChange={handleInputChange} placeholder="Task Title" style={styles.input} required />
                <input name="description" value={formState.description} onChange={handleInputChange} placeholder="Description" style={{...styles.input, flex: 2}} />
                <select name="status" value={formState.status} onChange={handleInputChange} style={styles.select}>
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="canceled">Canceled</option>
                </select>
                <select name="priority" value={formState.priority} onChange={handleInputChange} style={styles.select}>
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <button type="submit" style={styles.button}>Create Task</button>
            </form>

            {isLoading && <p>Loading tasks...</p>}
            {error && <p style={{ color: '#ff8080' }}>{error}</p>}
            
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Title</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Priority</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => (
                        <tr key={task.id}>
                            <td style={styles.td}>{task.title}</td>
                            <td style={styles.td}>{task.status}</td>
                            <td style={styles.td}>{task.priority}</td>
                            <td style={styles.td}>
                                <button onClick={() => handleDeleteTask(task.id)} style={{...styles.actionButton, ...styles.deleteButton}}>Delete</button>
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
    form: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' },
    input: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        color: '#eee',
        border: '1px solid #555',
        borderRadius: '3px',
        padding: '0.5rem',
    },
    select: {
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

export default TaskManagementPanel;