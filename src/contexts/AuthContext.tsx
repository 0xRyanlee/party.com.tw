'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AuthModal from '@/components/AuthModal';

interface AuthContextType {
    /** Trigger the AuthModal to open. Use this when a protected action is attempted by an unauthenticated user. */
    requireAuth: () => void;
    /** Current state of the modal */
    isAuthModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const requireAuth = useCallback(() => {
        setIsAuthModalOpen(true);
    }, []);

    return (
        <AuthContext.Provider value={{ requireAuth, isAuthModalOpen }}>
            {children}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth context.
 * Call `requireAuth()` to open the login modal when user tries to access protected content.
 * 
 * @example
 * const { requireAuth } = useAuth();
 * 
 * const handleProtectedAction = () => {
 *   if (!user) {
 *     requireAuth();
 *     return;
 *   }
 *   // ... proceed with protected action
 * };
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
