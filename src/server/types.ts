// Basic types for user, role, and permission management.

export interface User {
    id: number;
    email: string;
    passwordHash: string;
    roles: string[]; // Array of role names
}

export interface Role {
    id: number;
    name: string;
    permissions: string[]; // Array of permission actions
}

export interface Permission {
    id: number;
    action: string; // e.g., 'task.create'
    subject: string;
}

export interface Module {
    id: number;
    name: string; // unique
    version: string;
    description: string;
    isActive: boolean;
    configSchema: Record<string, any>; // JSON schema
}

export interface Tag {
    id: number;
    name: string;
    color: string;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: 'backlog' | 'todo' | 'inprogress' | 'done' | 'canceled';
    priority: 'none' | 'low' | 'medium' | 'high';
    isMilestone: boolean;
    
    parentId?: number | null;
    
    assigneeIds: number[];
    tagIds: number[];
    dependencyIds: number[];
    
    checklist: { text: string; completed: boolean }[];
    recurrenceRule?: string | null;

    startDate?: string | null;
    dueDate?: string | null;
}
