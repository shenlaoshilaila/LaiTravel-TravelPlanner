"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
    csrfToken: string | null;
    setCsrfToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

    return (
        <AuthContext.Provider value={{ csrfToken, setCsrfToken }}>
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