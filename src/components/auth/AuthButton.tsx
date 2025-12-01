"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Provider } from "@supabase/supabase-js";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface AuthButtonProps {
    provider: Provider | 'line'; // Supabase types might not include 'line' explicitly if using custom OIDC
    label: string;
    icon?: React.ReactNode;
    className?: string;
    redirectTo?: string;
}

export default function AuthButton({ provider, label, icon, className, redirectTo }: AuthButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider as Provider,
                options: {
                    redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                console.error("Login error:", error);
                // Ideally show a toast notification here
            }
        } catch (err) {
            console.error("Unexpected login error:", err);
        } finally {
            // Don't set loading to false immediately to prevent flash if redirect happens fast
            // But if error, we should reset
            setTimeout(() => setIsLoading(false), 2000);
        }
    };

    return (
        <Button
            variant="outline"
            className={`w-full flex items-center justify-center gap-2 h-12 text-base font-medium rounded-xl ${className}`}
            onClick={handleLogin}
            disabled={isLoading}
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
            {label}
        </Button>
    );
}
