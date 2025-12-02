'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, LogOut, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ManagementClientProps {
    isAuthenticated: boolean;
}

export default function ManagementClient({ isAuthenticated: initialAuth }: ManagementClientProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (data.success) {
                setIsAuthenticated(true);
                setPassword('');
                router.refresh();
            } else {
                setError(data.error || 'Invalid password');
            }
        } catch (err) {
            setError('Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            setIsAuthenticated(false);
            router.refresh();
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <Card className="w-full max-w-md rounded-[32px] border-gray-100 shadow-sm">
                    <CardHeader className="text-center space-y-2 pb-4">
                        <div className="w-16 h-16 rounded-full bg-black mx-auto flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold">管理後台</CardTitle>
                        <p className="text-sm text-gray-500">請輸入密碼以訪問管理功能</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="輸入管理密碼"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="rounded-xl h-12"
                                    disabled={loading}
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-sm text-red-500">{error}</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full rounded-xl h-12 bg-black text-white hover:bg-gray-800"
                                disabled={loading || !password}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        驗證中...
                                    </>
                                ) : (
                                    '登入'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">管理後台</h1>
                            <p className="text-sm text-gray-500">管理活動、橫幅和公告</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="rounded-full"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            登出
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Banners Card */}
                    <Link href="/admin/banners">
                        <Card className="rounded-[24px] border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-lg">橫幅管理</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">管理首頁橫幅和廣告</p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Announcements Card */}
                    <Link href="/admin/announcements">
                        <Card className="rounded-[24px] border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-lg">公告管理</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">管理系統公告和通知</p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Events Card */}
                    <Link href="/admin">
                        <Card className="rounded-[24px] border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-lg">活動管理</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">查看和管理所有活動</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <Card className="rounded-[24px] border-gray-100 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold">-</p>
                                <p className="text-sm text-gray-500 mt-1">總活動數</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-[24px] border-gray-100 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold">-</p>
                                <p className="text-sm text-gray-500 mt-1">活躍橫幅</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-[24px] border-gray-100 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold">-</p>
                                <p className="text-sm text-gray-500 mt-1">系統公告</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
