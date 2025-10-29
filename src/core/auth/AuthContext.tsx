import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { AuthService } from './AuthService';
import { User } from '../../server/types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'gameforge-auth-token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkToken = () => {
            try {
                const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
                if (storedToken) {
                    setToken(storedToken);
                    // In a real app, you'd decode the token to get user info or fetch it from an API
                    const decodedPayload = JSON.parse(atob(storedToken.split('_')[2]));
                    setUser({
                        id: decodedPayload.sub,
                        email: decodedPayload.email,
                        roles: decodedPayload.roles,
                        passwordHash: '' // Not available on client
                    });
                }
            } catch (e) {
                console.error("Failed to parse token from localStorage", e);
                localStorage.removeItem(AUTH_TOKEN_KEY);
            } finally {
                setIsLoading(false);
            }
        };
        checkToken();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        const result = await AuthService.login(email, password);
        if (result && result.accessToken) {
            setToken(result.accessToken);
            const decodedPayload = JSON.parse(atob(result.accessToken.split('_')[2]));
            setUser({
                id: decodedPayload.sub,
                email: decodedPayload.email,
                roles: decodedPayload.roles,
                passwordHash: ''
            });
            try {
                localStorage.setItem(AUTH_TOKEN_KEY, result.accessToken);
            } catch (e) {
                console.error("Failed to save token to localStorage", e);
            }
        } else {
            setError("Login failed. Please check your credentials.");
        }
        setIsLoading(false);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        try {
            localStorage.removeItem(AUTH_TOKEN_KEY);
        } catch (e) {
            console.error("Failed to remove token from localStorage", e);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, error, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
