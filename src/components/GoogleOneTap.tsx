'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        auto_select?: boolean;
                        cancel_on_tap_outside?: boolean;
                    }) => void;
                    prompt: (notification?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
                    renderButton: (element: HTMLElement | null, config: { theme?: string; size?: string; text?: string; width?: number }) => void;
                    disableAutoSelect: () => void;
                };
            };
        };
    }
}

interface GoogleOneTapProps {
    onSuccess?: () => void;
}

export default function GoogleOneTap({ onSuccess }: GoogleOneTapProps) {
    const supabase = createClient();
    const router = useRouter();

    const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
        try {
            // Use Supabase's signInWithIdToken for Google One Tap
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
            });

            if (error) {
                console.error('Google One Tap login error:', error);
                return;
            }

            if (data.session) {
                console.log('Google One Tap login successful');
                router.refresh();
                onSuccess?.();
            }
        } catch (error) {
            console.error('Google One Tap error:', error);
        }
    }, [supabase, router, onSuccess]);

    useEffect(() => {
        // Check if user is already logged in
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                return; // Don't show One Tap if already logged in
            }

            // Initialize Google One Tap
            const initializeOneTap = () => {
                if (!window.google) return;

                const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
                if (!clientId) {
                    console.warn('Google Client ID not configured');
                    return;
                }

                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });

                window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed()) {
                        console.log('One Tap not displayed');
                    }
                    if (notification.isSkippedMoment()) {
                        console.log('One Tap skipped');
                    }
                });
            };

            // Wait for Google script to load
            if (window.google) {
                initializeOneTap();
            } else {
                // Script will be loaded from layout.tsx
                const checkGoogleLoaded = setInterval(() => {
                    if (window.google) {
                        clearInterval(checkGoogleLoaded);
                        initializeOneTap();
                    }
                }, 100);

                // Clear interval after 5 seconds
                setTimeout(() => clearInterval(checkGoogleLoaded), 5000);
            }
        };

        checkSession();
    }, [supabase, handleCredentialResponse]);

    // This component doesn't render anything visible
    // Google One Tap appears as an overlay
    return null;
}
