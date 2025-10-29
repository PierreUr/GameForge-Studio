import { User, Role, Permission, Module, Task, Tag } from '../types';

// Simulates a database using in-memory arrays.
interface InMemoryDatabase {
    users: User[];
    roles: Role[];
    permissions: Permission[];
    modules: Module[];
    tasks: Task[];
    tags: Tag[];
    nextUserId: number;
    nextRoleId: number;
    nextPermissionId: number;
    nextModuleId: number;
    nextTaskId: number;
    nextTagId: number;
}

const DATABASE_KEY = 'gameforge-db-simulation';

const getDefaultDatabase = (): InMemoryDatabase => ({
    users: [
        { id: 1, email: 'admin@gameforge.com', passwordHash: 'hashed_admin_password', roles: ['ADMIN'] },
        { id: 2, email: 'user@gameforge.com', passwordHash: 'hashed_user_password', roles: ['USER'] },
        { id: 3, email: 'superadmin@gameforge.com', passwordHash: 'hashed_superadmin_password', roles: ['ADMIN', 'SUPER_ADMIN'] }
    ],
    roles: [
        { id: 1, name: 'ADMIN', permissions: ['manage_users', 'manage_roles'] },
        { id: 2, name: 'USER', permissions: ['view_content'] },
        { id: 3, name: 'SUPER_ADMIN', permissions: ['manage_modules'] }
    ],
    permissions: [
        { id: 1, action: 'manage_users', subject: 'Allows managing users.' },
        { id: 2, action: 'manage_roles', subject: 'Allows managing roles.' },
        { id: 3, action: 'view_content', subject: 'Allows viewing content.' },
        { id: 4, action: 'manage_modules', subject: 'Allows managing system modules.'}
    ],
    modules: [],
    tasks: [],
    tags: [],
    nextUserId: 4,
    nextRoleId: 4,
    nextPermissionId: 5,
    nextModuleId: 1,
    nextTaskId: 1,
    nextTagId: 1,
});

const loadDatabase = (): InMemoryDatabase => {
    try {
        const storedDb = localStorage.getItem(DATABASE_KEY);
        if (storedDb) {
            return JSON.parse(storedDb);
        }
    } catch (error) {
        console.error("Failed to load database from localStorage, initializing with defaults.", error);
    }
    const defaultDb = getDefaultDatabase();
    localStorage.setItem(DATABASE_KEY, JSON.stringify(defaultDb));
    return defaultDb;
};

export const saveDatabase = (): void => {
    try {
        localStorage.setItem(DATABASE_KEY, JSON.stringify(database));
    } catch (error) {
        console.error("Failed to save database to localStorage.", error);
    }
};

export const database: InMemoryDatabase = loadDatabase();