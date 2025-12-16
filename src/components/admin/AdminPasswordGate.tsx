'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Shield, AlertTriangle } from 'lucide-react';

interface AdminPasswordGateProps {
    children: React.ReactNode;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 分鐘

export default function AdminPasswordGate({ children }: AdminPasswordGateProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(0);

    // 檢查本地存儲的認證狀態
    useEffect(() => {
        const authToken = sessionStorage.getItem('admin_auth_token');
        const authExpiry = sessionStorage.getItem('admin_auth_expiry');

        if (authToken && authExpiry) {
            const expiry = parseInt(authExpiry);
            if (Date.now() < expiry) {
                setIsAuthenticated(true);
            } else {
                sessionStorage.removeItem('admin_auth_token');
                sessionStorage.removeItem('admin_auth_expiry');
            }
        }

        // 檢查鎖定狀態
        const storedLockout = localStorage.getItem('admin_lockout');
        const storedAttempts = localStorage.getItem('admin_attempts');

        if (storedLockout) {
            const lockout = parseInt(storedLockout);
            if (Date.now() < lockout) {
                setLockoutUntil(lockout);
            } else {
                localStorage.removeItem('admin_lockout');
                localStorage.removeItem('admin_attempts');
            }
        }

        if (storedAttempts) {
            setAttempts(parseInt(storedAttempts));
        }
    }, []);

    // 倒計時更新
    useEffect(() => {
        if (!lockoutUntil) return;

        const interval = setInterval(() => {
            const remaining = Math.max(0, lockoutUntil - Date.now());
            setTimeRemaining(remaining);

            if (remaining === 0) {
                setLockoutUntil(null);
                setAttempts(0);
                localStorage.removeItem('admin_lockout');
                localStorage.removeItem('admin_attempts');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lockoutUntil]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (lockoutUntil && Date.now() < lockoutUntil) {
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (data.success) {
                // 設置會話認證（2小時有效）
                const expiry = Date.now() + 2 * 60 * 60 * 1000;
                sessionStorage.setItem('admin_auth_token', data.token);
                sessionStorage.setItem('admin_auth_expiry', expiry.toString());

                localStorage.removeItem('admin_attempts');
                localStorage.removeItem('admin_lockout');

                setIsAuthenticated(true);
                setAttempts(0);
            } else {
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);
                localStorage.setItem('admin_attempts', newAttempts.toString());

                if (newAttempts >= MAX_ATTEMPTS) {
                    const lockout = Date.now() + LOCKOUT_DURATION;
                    setLockoutUntil(lockout);
                    localStorage.setItem('admin_lockout', lockout.toString());
                    setError(`密碼錯誤次數過多，請 ${LOCKOUT_DURATION / 60000} 分鐘後再試`);
                } else {
                    setError(`密碼錯誤，還有 ${MAX_ATTEMPTS - newAttempts} 次機會`);
                }
            }
        } catch {
            setError('認證失敗，請稍後再試');
        } finally {
            setIsLoading(false);
            setPassword('');
        }
    };

    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (isAuthenticated) {
        return <>{children}</>;
    }

    const isLocked = lockoutUntil && Date.now() < lockoutUntil;

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {isLocked ? (
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        ) : (
                            <Shield className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Admin 認證
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">
                        請輸入管理員密碼以繼續
                    </p>
                </div>

                {isLocked ? (
                    <div className="text-center py-8">
                        <p className="text-red-500 font-medium mb-2">
                            帳戶已暫時鎖定
                        </p>
                        <p className="text-3xl font-mono text-gray-800 dark:text-gray-200">
                            {formatTime(timeRemaining)}
                        </p>
                        <p className="text-sm text-gray-500 mt-4">
                            為保護系統安全，請稍後再試
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="管理員密碼"
                                className="pl-10 h-12"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 text-center">{error}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl"
                            disabled={isLoading || !password}
                        >
                            {isLoading ? '驗證中...' : '驗證'}
                        </Button>

                        <p className="text-xs text-center text-gray-400">
                            嘗試次數：{attempts} / {MAX_ATTEMPTS}
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
