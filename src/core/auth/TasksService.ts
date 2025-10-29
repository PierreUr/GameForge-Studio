import { TasksService as SimulatedTasksService } from '../../server/services/TasksService';
import { Task } from '../../server/types';

class ClientTasksService {
    private static instance: ClientTasksService;
    private simulatedService: SimulatedTasksService;

    private constructor() {
        this.simulatedService = new SimulatedTasksService();
    }

    public static getInstance(): ClientTasksService {
        if (!ClientTasksService.instance) {
            ClientTasksService.instance = new ClientTasksService();
        }
        return ClientTasksService.instance;
    }

    public async getAllTasks(): Promise<Task[]> {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
        return this.simulatedService.findAll();
    }
    
    public async createTask(data: Omit<Task, 'id'>): Promise<Task> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.simulatedService.create(data);
    }
    
    public async updateTask(id: number, data: Partial<Omit<Task, 'id'>>): Promise<Task | null> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.simulatedService.update(id, data);
    }

    public async deleteTask(id: number): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.simulatedService.delete(id);
    }
}

export const TasksService = ClientTasksService.getInstance();
