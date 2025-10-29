import { UsersService } from './UsersService';
import { User } from '../types';

// This is a simplified simulation of bcrypt and JWT.
const simpleHash = (password: string) => `hashed_${password}`;
const simpleCompare = (password: string, hash: string) => hash === `hashed_${password}`;

/**
 * @class AuthService
 * @description Simulates a service for user registration and login.
 */
export class AuthService {
    private usersService: UsersService;

    constructor() {
        this.usersService = new UsersService();
    }

    public register(email: string, password: string): User {
        const passwordHash = simpleHash(password);
        return this.usersService.create(email, passwordHash);
    }

    public login(email: string, password: string): { accessToken: string } | null {
        const user = this.usersService.findByEmail(email);
        if (user && simpleCompare(password, user.passwordHash)) {
            // Simulate JWT token creation
            const payload = { sub: user.id, email: user.email, roles: user.roles };
            const accessToken = `mock_jwt_${btoa(JSON.stringify(payload))}`;
            return { accessToken };
        }
        return null;
    }
}
