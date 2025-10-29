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