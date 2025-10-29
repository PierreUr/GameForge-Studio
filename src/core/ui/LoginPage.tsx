import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(email, password);
    };

    const handleQuickLogin = (userType: 'superadmin' | 'admin' | 'user') => {
        const credentials = {
            superadmin: { email: 'superadmin@gameforge.com', pass: 'superadmin_password' },
            admin: { email: 'admin@gameforge.com', pass: 'admin_password' },
            user: { email: 'user@gameforge.com', pass: 'user_password' },
        };
        setEmail(credentials[userType].email);
        setPassword(credentials[userType].pass);
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <h1 style={styles.title}>GameForge Studio</h1>
                <p style={styles.subtitle}>Please sign in to continue</p>
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="email" style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {error && <p style={styles.errorText}>{error}</p>}
                    <button type="submit" disabled={isLoading} style={styles.button}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                    
                    <div style={styles.quickLoginContainer}>
                         <button type="button" onClick={() => handleQuickLogin('superadmin')} style={styles.quickLoginButton}>
                            Login as Super Admin
                        </button>
                        <button type="button" onClick={() => handleQuickLogin('admin')} style={styles.quickLoginButton}>
                            Login as Admin
                        </button>
                        <button type="button" onClick={() => handleQuickLogin('user')} style={styles.quickLoginButton}>
                            Login as User
                        </button>
                    </div>

                    <p style={styles.infoText}>
                        Hint: Use quick login buttons or enter credentials manually.
                    </p>
                </form>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    loginBox: {
        width: '100%',
        maxWidth: '400px',
        padding: '3rem',
        backgroundColor: '#2a2a2a',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        border: '1px solid #444',
    },
    title: {
        textAlign: 'center',
        margin: '0 0 0.5rem 0',
        fontSize: '2rem',
        fontWeight: 600,
    },
    subtitle: {
        textAlign: 'center',
        margin: '0 0 2rem 0',
        color: '#999',
    },
    inputGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        color: '#ccc',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#1e1e1e',
        border: '1px solid #444',
        borderRadius: '4px',
        color: '#d4d4d4',
        fontSize: '1rem',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#007acc',
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    errorText: {
        color: '#ff8080',
        textAlign: 'center',
        marginBottom: '1rem',
    },
    infoText: {
        fontSize: '0.8rem',
        color: '#777',
        textAlign: 'center',
        marginTop: '1.5rem',
    },
    quickLoginContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '0.5rem',
        marginTop: '1rem',
    },
    quickLoginButton: {
        flex: 1,
        padding: '0.5rem',
        backgroundColor: '#444',
        border: '1px solid #666',
        borderRadius: '4px',
        color: '#eee',
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
};

export default LoginPage;