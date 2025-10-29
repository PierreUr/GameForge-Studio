import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../../../server/types';
import { TasksService } from '../../auth/TasksService';
import { EventBus } from '../../ecs/EventBus';

interface TaskListWidgetProps {
    title?: string;
}

const TaskListWidget: React.FC<TaskListWidgetProps> = ({ title = "Task List" }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        
        const handleTasksUpdated = () => fetchTasks();
        EventBus.getInstance().subscribe('tasks:updated', handleTasksUpdated);

        return () => {
            EventBus.getInstance().unsubscribe('tasks:updated', handleTasksUpdated);
        };
    }, [fetchTasks]);

    const handleDeleteTask = async (id: number) => {
        try {
            const wasDeleted = await TasksService.deleteTask(id);
            if (wasDeleted) {
                setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
            } else {
                alert('Task could not be deleted. It may have already been removed.');
                fetchTasks();
            }
        } catch (error) {
            console.error(`Failed to delete task ${id}:`, error);
            alert('An error occurred while deleting the task.');
        }
    };

    return (
        <div style={styles.container}>
            <h4>{title}</h4>
            {isLoading && <p>Loading tasks...</p>}
            {error && <p style={{ color: '#ff8080' }}>{error}</p>}
            
            <div style={styles.tableContainer}>
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
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#252526' },
    tableContainer: {
        flex: 1,
        overflowY: 'auto'
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
        borderBottom: '1px solid #444',
        padding: '0.75rem',
        textAlign: 'left',
        backgroundColor: '#3a3a3a',
        position: 'sticky',
        top: 0,
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

export default TaskListWidget;