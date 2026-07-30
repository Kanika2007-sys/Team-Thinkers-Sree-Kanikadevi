import React, { createContext, useContext, useState } from 'react';

const SESSION_KEY = 'civic_session';

const readSession = () => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
        return null;
    }

    try {
        const parsed = JSON.parse(stored);
        if (parsed?.expiresAt && Date.now() > parsed.expiresAt) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return parsed;
    } catch (error) {
        console.error('Failed to parse cached session', error);
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
};

const persistSession = (session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(() => readSession());

    const login = (name, role, profile = {}) => {
        const normalizedRole = role === 'admin' ? 'admin' : 'citizen';
        const nextSession = {
            token: `civic-${normalizedRole}-${Date.now()}`,
            issuedAt: Date.now(),
            expiresAt: Date.now() + 8 * 60 * 60 * 1000,
            user: {
                name,
                role: normalizedRole,
                ...profile,
            },
        };

        setSession(nextSession);
        persistSession(nextSession);
    };

    const logout = () => {
        setSession(null);
        localStorage.removeItem(SESSION_KEY);
    };

    const updateUser = (profile = {}) => {
        setSession((current) => {
            if (!current) {
                return current;
            }

            const nextSession = {
                ...current,
                user: {
                    ...current.user,
                    ...profile,
                },
            };

            persistSession(nextSession);
            return nextSession;
        });
    };

    const user = session?.user || null;
    const isAuthenticated = !!session?.token;
    const isSessionValid = !session?.expiresAt || Date.now() < session.expiresAt;
    const isAdmin = user?.role === 'admin';
    const isCitizen = user?.role === 'citizen';

    return (
        <AuthContext.Provider value={{ user, session, login, logout, updateUser, isAuthenticated, isSessionValid, isAdmin, isCitizen }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
