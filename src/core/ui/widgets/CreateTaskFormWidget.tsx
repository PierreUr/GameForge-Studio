import React, { useState } from 'react';
import { Task } from '../../../server/types';
import { TasksService } from '../../auth/TasksService';
import { EventBus } from '../../ecs/EventBus';

interface CreateTaskFormWidgetProps {
    buttonText?: string;
}

const CreateTaskFormWidget: React.FC<CreateTaskFormWidgetProps> = ({ buttonText = "Create Task" }) => {
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        status: 'todo' as Task['status'],
        priority: 'none' as Task['priority'],
    });

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
            EventBus.getInstance().publish('tasks:updated');
        } catch (err) {
            alert((err as Error).message);
        }
    };

    return (
        <div style={styles.container}>
             <h4>Create New Task</h4>
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
                <button type="submit" style={styles.button}>{buttonText}</button>
            </form>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '1rem', backgroundColor: '#252526', borderBottom: '1px solid #444' },
    form: { display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 },
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
};

export default CreateTaskFormWidget;