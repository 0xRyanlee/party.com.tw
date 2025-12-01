"use client";

import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AuthButton from "@/components/auth/AuthButton";
import { Mail, Loader2 } from "lucide-react";

export default function AuthPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsEmailLoading(true);
        setMessage("");

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setMessage("Error: " + error.message);
        } else {
            setMessage("Check your email for the magic link!");
        }
        setIsEmailLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to Party</h1>
                    <p className="text-gray-500">Sign in to discover and host events</p>
                </div>

                <div className="space-y-4">
                    {/* Social Login Buttons */}
                    <AuthButton
                        provider="google"
                        label="Continue with Google"
                        icon={<svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>}
                    />

                    <AuthButton
                        provider="apple"
                        label="Continue with Apple"
                        icon={<svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.62 4.37-1.62 1.03.06 2.04.45 2.87 1.02-2.46 1.49-2.05 5.8 1.02 7.16-.61 1.9-1.46 3.8-2.34 5.67zM12.03 5.32c-.25-1.6 1.25-3.11 2.63-3.32.33 1.8-1.57 3.25-2.63 3.32z" /></svg>}
                    />

                    {/* Line Login - Note: Supabase might require custom config or OIDC for Line */}
                    <AuthButton
                        provider="line" // Ensure this is configured in Supabase
                        label="Continue with Line"
                        icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="#00C300"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.604.391.084.922.258 1.057.592.121.303.079.778.038 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.992 2.61-4.128 2.61-6.288zM12 16.5c-4.963 0-9-3.364-9-7.5s4.037-7.5 9-7.5 9 3.364 9 7.5-4.037 7.5-9 7.5z" /></svg>}
                        className="text-[#00C300] hover:text-[#00C300] hover:bg-[#00C300]/10"
                    />
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                    </div>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full rounded-xl bg-black text-white hover:bg-gray-800" disabled={isEmailLoading}>
                        {isEmailLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                        Send Magic Link
                    </Button>
                    {message && (
                        <p className={`text-sm text-center ${message.includes("Error") ? "text-red-500" : "text-emerald-600"}`}>
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
