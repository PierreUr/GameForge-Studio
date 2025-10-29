import { UsersService as SimulatedUsersService } from '../../server/services/UsersService';
import { User } from '../../server/types';
import { database } from '../../server/services/db';

class ClientUsersService {
    private static instance: ClientUsersService;
    private simulatedService: SimulatedUsersService;

    private constructor() {
        this.simulatedService = new SimulatedUsersService();
    }

    public static getInstance(): ClientUsersService {
        if (!ClientUsersService.instance) {
            ClientUsersService.instance = new ClientUsersService();
        }
        return ClientUsersService.instance;
    }

    public async getAllUsers(): Promise<User[]> {
        await new Promise(resolve => setTimeout(resolve, 200)); // Simulate delay
        return database.users;
    }
    
    public async assignRole(userId: number, roleName: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return this.simulatedService.assignRoleToUser(userId, roleName);
    }
}

export const UsersService = ClientUsersService.getInstance();
