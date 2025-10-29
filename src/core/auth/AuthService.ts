import { AuthService as SimulatedAuthService } from '../../server/services/AuthService';
import { User } from '../../server/types';

/**
 * @class ClientAuthService
 * @description A client-side service to interact with the (simulated) authentication backend.
 * In a real application, this would use fetch() to make HTTP requests.
 */
class ClientAuthService {
    private static instance: ClientAuthService;
    private simulatedService: SimulatedAuthService;

    private constructor() {
        this.simulatedService = new SimulatedAuthService();
    }

    public static getInstance(): ClientAuthService {
        if (!ClientAuthService.instance) {
            ClientAuthService.instance = new ClientAuthService();
        }
        return ClientAuthService.instance;
    }

    /**
     * Simulates a login request to the backend.
     * @param email The user's email.
     * @param password The user's password.
     * @returns A promise that resolves with an access token object or null if login fails.
     */
    public async login(email: string, password: string): Promise<{ accessToken: string } | null> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
            const result = this.simulatedService.login(email, password);
            if (!result) {
                throw new Error("Invalid credentials");
            }
            return result;
        } catch (error) {
            console.error('[ClientAuthService] Login failed:', (error as Error).message);
            return null;
        }
    }

    /**
     * Simulates a registration request.
     * @param email The user's email.
     * @param password The user's password.
     * @returns A promise that resolves with the new User object or null on failure.
     */
    public async register(email: string, password: string): Promise<User | null> {
         await new Promise(resolve => setTimeout(resolve, 500));
         try {
            return this.simulatedService.register(email, password);
         } catch (error) {
            console.error('[ClientAuthService] Registration failed:', (error as Error).message);
            return null;
         }
    }
}

export const AuthService = ClientAuthService.getInstance();
