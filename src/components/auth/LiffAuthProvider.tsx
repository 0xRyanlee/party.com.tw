'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

declare global {
    interface Window {
        liff: any;
    }
}

const LIFF_ID = '2008621982-mXGPnRy9';

export function LiffAuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const supabase = createClient();
    const [isLiffReady, setIsLiffReady] = useState(false);
    const [isInLiff, setIsInLiff] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Load LIFF SDK from CDN
        const script = document.createElement('script');
        script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
        script.async = true;

        script.onload = async () => {
            try {
                await window.liff.init({ liffId: LIFF_ID });
                setIsLiffReady(true);
                setIsInLiff(window.liff.isInClient());

                // Only process if in LIFF browser
                if (!window.liff.isInClient()) {
                    return;
                }

                setIsProcessing(true);

                // If not logged in, trigger login
                if (!window.liff.isLoggedIn()) {
                    window.liff.login();
                    return;
                }

                // Get LINE profile
                const liffProfile = await window.liff.getProfile();

                // Exchange LINE profile for Supabase session
                const { data: existingUser } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('line_user_id', liffProfile.userId)
                    .single();

                if (existingUser) {
                    router.push('/?line_login=success');
                } else {
                    await supabase.from('profiles').insert({
                        line_user_id: liffProfile.userId,
                        full_name: liffProfile.displayName,
                        avatar_url: liffProfile.pictureUrl,
                        email: null,
                    });
                    router.push('/?line_login=success&new_user=true');
                }
            } catch (error) {
                console.error('LIFF error:', error);
                // Fallback to standard LINE Login
                if (window.liff?.isInClient()) {
                    router.push('/api/auth/line/authorize');
                }
            } finally {
                setIsProcessing(false);
            }
        };

        script.onerror = () => {
            console.error('Failed to load LIFF SDK');
            setIsLiffReady(true); // Continue without LIFF
        };

        document.body.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [router, supabase]);

    // Show loading only if in LIFF and processing
    if (isInLiff && isProcessing) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">正在連接 LINE...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
