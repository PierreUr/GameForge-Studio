import { database as db, saveDatabase } from './db';
import { Role } from '../types';

/**
 * @class RolesService
 * @description Simulates a service for managing roles and permissions.
 */
export class RolesService {

    public findAll(): Role[] {
        return db.roles;
    }

    public create(name: string, permissions: string[]): Role {
        if (db.roles.some(r => r.name === name)) {
            throw new Error(`Role with name "${name}" already exists.`);
        }
        const newRole: Role = {
            id: db.nextRoleId++,
            name,
            permissions,
        };
        db.roles.push(newRole);
        saveDatabase();
        return newRole;
    }

    public update(id: number, name: string, permissions: string[]): Role | null {
        const role = db.roles.find(r => r.id === id);
        if (role) {
            role.name = name;
            role.permissions = permissions;
            saveDatabase();
            return role;
        }
        return null;
    }

    public delete(id: number): boolean {
        const index = db.roles.findIndex(r => r.id === id);
        if (index !== -1) {
            db.roles.splice(index, 1);
            saveDatabase();
            return true;
        }
        return false;
    }
    
    public assignPermissionToRole(roleId: number, permissionAction: string): boolean {
        const role = db.roles.find(r => r.id === roleId);
        const permissionExists = db.permissions.some(p => p.action === permissionAction);

        if (role && permissionExists && !role.permissions.includes(permissionAction)) {
            role.permissions.push(permissionAction);
            saveDatabase();
            return true;
        }
        return false;
    }
}