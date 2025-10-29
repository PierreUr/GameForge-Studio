import { ModulesService as SimulatedModulesService } from '../../server/services/ModulesService';
import { Module } from '../../server/types';

class ClientModulesService {
    private static instance: ClientModulesService;
    private simulatedService: SimulatedModulesService;

    private constructor() {
        this.simulatedService = new SimulatedModulesService();
    }

    public static getInstance(): ClientModulesService {
        if (!ClientModulesService.instance) {
            ClientModulesService.instance = new ClientModulesService();
        }
        return ClientModulesService.instance;
    }

    public async getAllModules(): Promise<Module[]> {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
        return this.simulatedService.findAll();
    }
    
    public async createModule(data: Omit<Module, 'id'>): Promise<Module> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.simulatedService.create(data);
    }
    
    public async updateModule(id: number, data: Partial<Omit<Module, 'id'>>): Promise<Module | null> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.simulatedService.update(id, data);
    }

    public async deleteModule(id: number): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.simulatedService.delete(id);
    }
}

export const ModulesService = ClientModulesService.getInstance();