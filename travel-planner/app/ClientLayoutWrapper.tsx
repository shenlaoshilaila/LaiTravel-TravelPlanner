// app/ClientLayoutWrapper.tsx
"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import ClientNavbar from './ClientNavbar';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider> {/* Wrap everything with AuthProvider */}
            <ClientNavbar /> {/* ✅ navbar with working login/register */}
            {children}
        </AuthProvider>
    );
}