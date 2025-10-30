import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../../../server/types';
import { TasksService } from '../../auth/TasksService';
import { EventBus } from '../../ecs/EventBus';

interface TaskListWidgetProps {
    title?: string;
    styles?: {
        typography?: React.CSSProperties;
    };
}

const TaskListWidget: React.FC<TaskListWidgetProps> = ({ title = "Task List", styles }) => {
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
    
    const titleStyle: React.CSSProperties = {
        ...defaultStyles.title,
        ...styles?.typography
    };

    return (
        <div style={defaultStyles.container}>
            <h4 style={titleStyle}>{title}</h4>
            {isLoading && <p>Loading tasks...</p>}
            {error && <p style={{ color: '#ff8080' }}>{error}</p>}
            
            <div style={defaultStyles.tableContainer}>
                <table style={defaultStyles.table}>
                    <thead>
                        <tr>
                            <th style={defaultStyles.th}>Title</th>
                            <th style={defaultStyles.th}>Status</th>
                            <th style={defaultStyles.th}>Priority</th>
                            <th style={defaultStyles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td style={defaultStyles.td}>{task.title}</td>
                                <td style={defaultStyles.td}>{task.status}</td>
                                <td style={defaultStyles.td}>{task.priority}</td>
                                <td style={defaultStyles.td}>
                                    <button onClick={() => handleDeleteTask(task.id)} style={{...defaultStyles.actionButton, ...defaultStyles.deleteButton}}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const defaultStyles: { [key: string]: React.CSSProperties } = {
    container: { padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#252526' },
    title: {
        margin: '0 0 1rem 0'
    },
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