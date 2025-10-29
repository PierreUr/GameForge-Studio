import { database as db, saveDatabase } from './db';
import { Task } from '../types';

/**
 * @class TasksService
 * @description Simulates a service for managing extended task data.
 */
export class TasksService {
    
    public findAll(): Task[] {
        return [...db.tasks];
    }

    public findOne(id: number): Task | undefined {
        return db.tasks.find(t => t.id === id);
    }

    /**
     * Creates a new task with the extended properties.
     * @param data - The data for the new task. It should be a partial object of the Task type.
     * @returns The newly created task.
     */
    public create(data: Omit<Task, 'id'>): Task {
        if (!data.title) {
            throw new Error('Task title is required.');
        }

        const newTask: Task = {
            id: db.nextTaskId++,
            title: data.title,
            description: data.description || '',
            status: data.status || 'todo',
            priority: data.priority || 'none',
            isMilestone: data.isMilestone || false,
            parentId: data.parentId || null,
            assigneeIds: data.assigneeIds || [],
            tagIds: data.tagIds || [],
            dependencyIds: data.dependencyIds || [],
            checklist: data.checklist || [],
            recurrenceRule: data.recurrenceRule || null,
            startDate: data.startDate || null,
            dueDate: data.dueDate || null,
        };

        db.tasks.push(newTask);
        saveDatabase();
        return newTask;
    }

    /**
     * Updates an existing task.
     * @param id - The ID of the task to update.
     * @param data - The partial data to update the task with.
     * @returns The updated task or null if not found.
     */
    public update(id: number, data: Partial<Omit<Task, 'id'>>): Task | null {
        const task = this.findOne(id);
        if (task) {
            // Merge the new data into the existing task object
            Object.assign(task, data);
            saveDatabase();
            return task;
        }
        return null;
    }

    /**
     * Deletes a task.
     * @param id - The ID of the task to delete.
     * @returns True if the task was deleted, false otherwise.
     */
    public delete(id: number): boolean {
        const initialLength = db.tasks.length;
        db.tasks = db.tasks.filter(t => t.id !== id);
        const wasDeleted = db.tasks.length < initialLength;
        if (wasDeleted) {
            // In a real DB, we'd also handle cascading deletes or cleaning up relations.
            saveDatabase();
        }
        return wasDeleted;
    }
}
