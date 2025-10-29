import { database as db, saveDatabase } from './db';
import { Module } from '../types';

/**
 * @class ModulesService
 * @description Simulates a service for managing system module data.
 */
export class ModulesService {
    
    public findAll(): Module[] {
        // Return a copy of the array to prevent mutation issues in React state
        return [...db.modules];
    }

    public findOne(id: number): Module | undefined {
        return db.modules.find(m => m.id === id);
    }

    public findByName(name: string): Module | undefined {
        return db.modules.find(m => m.name === name);
    }

    public getModuleConfig(moduleName: string): Record<string, any> | null {
        const module = this.findByName(moduleName);
        if (module) {
            return module.configSchema;
        }
        return null;
    }

    public create(data: Omit<Module, 'id'>): Module {
        if (db.modules.some(m => m.name === data.name)) {
            throw new Error(`Module with name "${data.name}" already exists.`);
        }
        const newModule: Module = {
            id: db.nextModuleId++,
            ...data,
        };
        db.modules.push(newModule);
        saveDatabase();
        return newModule;
    }

    public update(id: number, data: Partial<Omit<Module, 'id'>>): Module | null {
        const module = this.findOne(id);
        if (module) {
            Object.assign(module, data);
            saveDatabase();
            return module;
        }
        return null;
    }

    public delete(id: number): boolean {
        const initialLength = db.modules.length;
        // Re-assign the array instead of mutating it with splice
        db.modules = db.modules.filter(m => m.id !== id);
        const wasDeleted = db.modules.length < initialLength;
        if (wasDeleted) {
            saveDatabase();
        }
        return wasDeleted;
    }
}