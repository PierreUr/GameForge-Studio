import { database as db, saveDatabase } from './db';
import { User } from '../types';

/**
 * @class UsersService
 * @description Simulates a service for managing user data.
 */
export class UsersService {
    
    public findByEmail(email: string): User | undefined {
        return db.users.find(u => u.email === email);
    }
    
    public findById(id: number): User | undefined {
        return db.users.find(u => u.id === id);
    }

    public create(email: string, passwordHash: string): User {
        const existingUser = this.findByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists.');
        }

        const newUser: User = {
            id: db.nextUserId++,
            email,
            passwordHash,
            roles: ['USER'], // Default role
        };
        db.users.push(newUser);
        saveDatabase();
        return newUser;
    }

    public assignRoleToUser(userId: number, roleName: string): boolean {
        const user = this.findById(userId);
        const roleExists = db.roles.some(r => r.name === roleName);

        if (user && roleExists && !user.roles.includes(roleName)) {
            user.roles.push(roleName);
            saveDatabase();
            return true;
        }
        return false;
    }
}