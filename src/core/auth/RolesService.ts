import { RolesService as SimulatedRolesService } from '../../server/services/RolesService';
import { Role } from '../../server/types';
import { database } from '../../server/services/db';

class ClientRolesService {
    private static instance: ClientRolesService;
    private simulatedService: SimulatedRolesService;

    private constructor() {
        this.simulatedService = new SimulatedRolesService();
    }

    public static getInstance(): ClientRolesService {
        if (!ClientRolesService.instance) {
            ClientRolesService.instance = new ClientRolesService();
        }
        return ClientRolesService.instance;
    }

    public async getAllRoles(): Promise<Role[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return database.roles;
    }
    
    public async createRole(name: string, permissions: string[]): Promise<Role> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return this.simulatedService.create(name, permissions);
    }
}

export const RolesService = ClientRolesService.getInstance();
