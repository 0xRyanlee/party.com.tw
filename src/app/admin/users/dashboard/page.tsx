'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import {
    Users, TrendingUp, TrendingDown, UserPlus, Activity,
    Calendar, ArrowRight, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';

interface UserStats {
    totalUsers: number;
    newUsersToday: number;
    newUsersWeek: number;
    newUsersMonth: number;
    activeUsersToday: number;
    hostsCount: number;
    kolCount: number;
    vendorCount: number;
}

interface DailyData {
    date: string;
    users: number;
    registrations: number;
}

export default function UserDashboardPage() {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [dailyData, setDailyData] = useState<DailyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchData = async () => {
        setIsLoading(true);

        // 獲取用戶統計
        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const { count: newUsersToday } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        const { count: newUsersWeek } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', weekAgo.toISOString());

        const { count: newUsersMonth } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', monthAgo.toISOString());

        // 發起過活動的用戶數
        const { data: hostEvents } = await supabase
            .from('events')
            .select('host_id')
            .not('host_id', 'is', null);
        const uniqueHosts = new Set(hostEvents?.map((e: { host_id: string }) => e.host_id) || []).size;

        // KOL 和 Vendor 數量
        const { count: kolCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'kol');

        const { count: vendorCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'vendor');

        setStats({
            totalUsers: totalUsers || 0,
            newUsersToday: newUsersToday || 0,
            newUsersWeek: newUsersWeek || 0,
            newUsersMonth: newUsersMonth || 0,
            activeUsersToday: 0, // 需要活動追蹤
            hostsCount: uniqueHosts,
            kolCount: kolCount || 0,
            vendorCount: vendorCount || 0,
        });

        // 生成過去 30 天的模擬數據
        const last30Days: DailyData[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last30Days.push({
                date: date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
                users: Math.floor(Math.random() * 20) + (totalUsers || 0) - 30 + i,
                registrations: Math.floor(Math.random() * 5),
            });
        }
        setDailyData(last30Days);

        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const funnelData = [
        { name: '訪問', value: stats?.totalUsers ? stats.totalUsers * 10 : 0, fill: '#e0e0e0' },
        { name: '註冊', value: stats?.totalUsers || 0, fill: '#a0a0a0' },
        { name: '發起活動', value: stats?.hostsCount || 0, fill: '#606060' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">用戶儀表板</h2>
                    <p className="text-gray-500">用戶增長與行為分析</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        刷新
                    </Button>
                    <Link href="/admin/users">
                        <Button size="sm">
                            用戶列表
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">總用戶數</p>
                                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">本月新增</p>
                                <p className="text-3xl font-bold">{stats?.newUsersMonth || 0}</p>
                                <p className="text-xs text-green-500 flex items-center mt-1">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    本週 +{stats?.newUsersWeek || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">活動發起者</p>
                                <p className="text-3xl font-bold">{stats?.hostsCount || 0}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    轉化率 {stats?.totalUsers ? ((stats.hostsCount / stats.totalUsers) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">認證用戶</p>
                                <p className="text-3xl font-bold">{(stats?.kolCount || 0) + (stats?.vendorCount || 0)}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    KOL: {stats?.kolCount || 0} | Vendor: {stats?.vendorCount || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* User Growth Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>用戶增長趨勢</CardTitle>
                        <CardDescription>過去 30 天</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#3b82f6"
                                        fill="#93c5fd"
                                        name="累計用戶"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Daily Registrations */}
                <Card>
                    <CardHeader>
                        <CardTitle>每日註冊數</CardTitle>
                        <CardDescription>過去 30 天</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Bar dataKey="registrations" fill="#10b981" name="新增註冊" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Funnel */}
            <Card>
                <CardHeader>
                    <CardTitle>用戶漏斗</CardTitle>
                    <CardDescription>訪問 → 註冊 → 發起活動</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center gap-4 py-8">
                        {funnelData.map((item, i) => (
                            <div key={item.name} className="flex items-center">
                                <div className="text-center">
                                    <div
                                        className="rounded-lg flex items-center justify-center mx-auto mb-2"
                                        style={{
                                            backgroundColor: item.fill,
                                            width: 80 + (2 - i) * 30,
                                            height: 60 + (2 - i) * 20,
                                        }}
                                    >
                                        <span className="text-white font-bold text-lg">{item.value}</span>
                                    </div>
                                    <p className="text-sm font-medium">{item.name}</p>
                                    {i > 0 && (
                                        <p className="text-xs text-gray-400">
                                            {funnelData[i - 1].value > 0
                                                ? ((item.value / funnelData[i - 1].value) * 100).toFixed(1)
                                                : 0}%
                                        </p>
                                    )}
                                </div>
                                {i < funnelData.length - 1 && (
                                    <ArrowRight className="w-6 h-6 text-gray-300 mx-2" />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
