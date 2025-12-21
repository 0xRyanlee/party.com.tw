'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import {
    BarChart3, Users, Calendar, TrendingUp, TrendingDown,
    DollarSign, RefreshCw, Download, ArrowUpRight
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface PlatformStats {
    totalUsers: number;
    totalEvents: number;
    totalRegistrations: number;
    totalClubs: number;
    newUsersToday: number;
    newEventsToday: number;
    revenue: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboardPage() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
    const supabase = createClient();

    // 模擬趨勢數據
    const generateTrendData = (days: number) => {
        const data = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
                users: Math.floor(Math.random() * 10) + 1,
                events: Math.floor(Math.random() * 5),
                registrations: Math.floor(Math.random() * 20) + 5,
            });
        }
        return data;
    };

    const [trendData, setTrendData] = useState(generateTrendData(30));

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            { count: totalUsers },
            { count: totalEvents },
            { count: totalRegistrations },
            { count: totalClubs },
            { count: newUsersToday },
            { count: newEventsToday },
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('events').select('*', { count: 'exact', head: true }),
            supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
            supabase.from('clubs').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
            supabase.from('events').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        ]);

        setStats({
            totalUsers: totalUsers || 0,
            totalEvents: totalEvents || 0,
            totalRegistrations: totalRegistrations || 0,
            totalClubs: totalClubs || 0,
            newUsersToday: newUsersToday || 0,
            newEventsToday: newEventsToday || 0,
            revenue: 0, // TODO: 從實際交易數據計算
        });

        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        setTrendData(generateTrendData(days));

        setIsLoading(false);
    }, [supabase, timeRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const eventTypeData = [
        { name: '社交聚會', value: 35 },
        { name: '運動健身', value: 25 },
        { name: '學習成長', value: 20 },
        { name: '戶外冒險', value: 12 },
        { name: '其他', value: 8 },
    ];

    const exportCSV = () => {
        const csvContent = [
            ['日期', '新用戶', '新活動', '報名數'].join(','),
            ...trendData.map(d => [d.date, d.users, d.events, d.registrations].join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="w-6 h-6" />
                        數據儀表板
                    </h2>
                    <p className="text-gray-500">平台關鍵指標與趨勢分析</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                        {(['7d', '30d', '90d'] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${timeRange === range
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-gray-600 hover:text-black'
                                    }`}
                            >
                                {range === '7d' ? '7 天' : range === '30d' ? '30 天' : '90 天'}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        刷新
                    </Button>
                    <Button size="sm" onClick={exportCSV}>
                        <Download className="w-4 h-4 mr-2" />
                        導出 CSV
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">總用戶</p>
                                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                                <p className="text-xs text-green-500 flex items-center mt-1">
                                    <ArrowUpRight className="w-3 h-3" />
                                    今日 +{stats?.newUsersToday || 0}
                                </p>
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
                                <p className="text-sm text-gray-500">總活動</p>
                                <p className="text-3xl font-bold">{stats?.totalEvents || 0}</p>
                                <p className="text-xs text-green-500 flex items-center mt-1">
                                    <ArrowUpRight className="w-3 h-3" />
                                    今日 +{stats?.newEventsToday || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">總報名數</p>
                                <p className="text-3xl font-bold">{stats?.totalRegistrations || 0}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">總俱樂部</p>
                                <p className="text-3xl font-bold">{stats?.totalClubs || 0}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* User Growth */}
                <Card>
                    <CardHeader>
                        <CardTitle>用戶增長趨勢</CardTitle>
                        <CardDescription>過去 {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} 天</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="#93c5fd" name="新用戶" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>活動與報名</CardTitle>
                        <CardDescription>過去 {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} 天</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Bar dataKey="events" fill="#10b981" name="新活動" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="registrations" fill="#8b5cf6" name="報名數" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Event Types */}
            <Card>
                <CardHeader>
                    <CardTitle>活動類型分佈</CardTitle>
                    <CardDescription>各類型活動佔比</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center">
                        <div className="w-64 h-64">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={eventTypeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {eventTypeData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="ml-8 space-y-2">
                            {eventTypeData.map((item, index) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                    <span className="text-sm">{item.name}</span>
                                    <span className="text-sm text-gray-400">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
