"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
    Users, TrendingUp, TrendingDown, Calendar,
    ArrowUpRight, AlertTriangle, Eye, UserPlus,
    Ticket, CheckCircle, Download
} from "lucide-react";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Funnel,
    FunnelChart,
    LabelList,
} from "recharts";

interface RecentEvent {
    id: string;
    title: string;
    status: string;
    start_time: string | null;
    created_at: string;
}

interface RecentReport {
    id: string;
    type: string;
    category: string;
    status: string;
    created_at: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        events: 0,
        registrations: 0,
        reports: 0,
        pendingReports: 0,
        weeklyGrowth: { users: 0, events: 0, registrations: 0 },
    });
    const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
    const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
    const [chartData, setChartData] = useState<{ date: string; users: number; registrations: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const [
                { count: usersCount },
                { count: eventsCount },
                { count: registrationsCount },
                { count: reportsCount },
                { count: pendingReportsCount },
                { count: weeklyUsers },
                { count: weeklyEvents },
                { count: weeklyRegistrations },
                { data: eventsData },
                { data: reportsData },
                { data: userGrowthData },
            ] = await Promise.all([
                supabase.from("profiles").select("*", { count: "exact", head: true }),
                supabase.from("events").select("*", { count: "exact", head: true }),
                supabase.from("event_registrations").select("*", { count: "exact", head: true }),
                supabase.from("reports").select("*", { count: "exact", head: true }),
                supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
                supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", oneWeekAgo.toISOString()),
                supabase.from("events").select("*", { count: "exact", head: true }).gte("created_at", oneWeekAgo.toISOString()),
                supabase.from("event_registrations").select("*", { count: "exact", head: true }).gte("created_at", oneWeekAgo.toISOString()),
                supabase.from("events").select("id, title, status, start_time, created_at").order("created_at", { ascending: false }).limit(5),
                supabase.from("reports").select("id, type, category, status, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
                supabase.from("profiles").select("created_at").gte("created_at", startDate.toISOString()).order("created_at", { ascending: true }),
            ]);

            setStats({
                users: usersCount || 0,
                events: eventsCount || 0,
                registrations: registrationsCount || 0,
                reports: reportsCount || 0,
                pendingReports: pendingReportsCount || 0,
                weeklyGrowth: {
                    users: weeklyUsers || 0,
                    events: weeklyEvents || 0,
                    registrations: weeklyRegistrations || 0,
                },
            });
            setRecentEvents(eventsData || []);
            setRecentReports(reportsData || []);

            // 生成圖表數據
            const dailyData: Record<string, { users: number; registrations: number }> = {};
            for (let i = 0; i < days; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0];
                dailyData[key] = { users: 0, registrations: 0 };
            }

            (userGrowthData || []).forEach((u: { created_at: string }) => {
                const key = u.created_at.split('T')[0];
                if (dailyData[key]) {
                    dailyData[key].users++;
                }
            });

            const chartArr = Object.entries(dailyData)
                .map(([date, data]) => ({ date, ...data }))
                .reverse();

            // 累計計算
            let cumUsers = (usersCount || 0) - chartArr.reduce((acc, d) => acc + d.users, 0);
            chartArr.forEach(d => {
                cumUsers += d.users;
                d.users = cumUsers;
            });

            setChartData(chartArr);
            setIsLoading(false);
        };

        fetchData();
    }, [supabase, dateRange]);

    // 轉化漏斗數據
    const funnelData = [
        { name: '訪問', value: stats.users * 5, fill: '#18181b' },
        { name: '註冊', value: stats.users, fill: '#3f3f46' },
        { name: '報名', value: stats.registrations, fill: '#52525b' },
        { name: '簽到', value: Math.floor(stats.registrations * 0.7), fill: '#71717a' },
    ];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("zh-TW", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getGrowthPercent = (current: number, growth: number) => {
        if (current === 0) return 0;
        const prev = current - growth;
        if (prev === 0) return 100;
        return Math.round((growth / prev) * 100);
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">儀表板</h2>
                    <p className="text-muted-foreground">平台核心數據概覽</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex border rounded-lg overflow-hidden">
                        {(['7d', '30d', '90d'] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors ${dateRange === range
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                    }`}
                            >
                                {range === '7d' ? '7 天' : range === '30d' ? '30 天' : '90 天'}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        導出
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">總用戶</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {stats.weeklyGrowth.users > 0 ? (
                                <>
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">+{stats.weeklyGrowth.users}</span>
                                </>
                            ) : (
                                <span>—</span>
                            )}
                            <span className="ml-1">本週</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">總活動</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.events}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="text-green-500">+{stats.weeklyGrowth.events}</span>
                            <span className="ml-1">本週</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">總報名</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.registrations}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="text-green-500">+{stats.weeklyGrowth.registrations}</span>
                            <span className="ml-1">本週</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className={stats.pendingReports > 0 ? 'border-orange-200 bg-orange-50/50' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">待處理回報</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${stats.pendingReports > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingReports}</div>
                        <p className="text-xs text-muted-foreground">
                            共 {stats.reports} 件回報
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 lg:grid-cols-7">
                {/* 用戶增長趨勢 */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="text-base">用戶增長趨勢</CardTitle>
                        <CardDescription>累計用戶數</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#18181b" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#18181b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(v) => new Date(v).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white border rounded-lg shadow-lg p-3">
                                                        <p className="text-xs text-muted-foreground">{label}</p>
                                                        <p className="text-sm font-medium">{payload[0].value} 用戶</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#18181b"
                                        fill="url(#userGradient)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* 轉化漏斗 */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-base">轉化漏斗</CardTitle>
                        <CardDescription>訪問 → 註冊 → 報名 → 簽到</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {funnelData.map((item, index) => {
                                const prevValue = index > 0 ? funnelData[index - 1].value : item.value;
                                const rate = prevValue > 0 ? Math.round((item.value / prevValue) * 100) : 0;
                                const width = (item.value / funnelData[0].value) * 100;

                                return (
                                    <div key={item.name} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-muted-foreground">
                                                {item.value.toLocaleString()}
                                                {index > 0 && (
                                                    <span className="ml-2 text-xs">({rate}%)</span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="h-6 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${Math.max(width, 5)}%`,
                                                    backgroundColor: item.fill,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* 需要注意 */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                需要注意
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/admin/reports">處理回報 <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentReports.length === 0 ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                沒有待處理的回報
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>類型</TableHead>
                                        <TableHead>分類</TableHead>
                                        <TableHead>時間</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentReports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="font-medium">{report.type}</TableCell>
                                            <TableCell>{report.category}</TableCell>
                                            <TableCell className="text-muted-foreground text-xs">
                                                {formatDate(report.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href="/admin/reports">處理</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* 最近活動 */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">最近活動</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/admin/events">查看全部 <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentEvents.length === 0 ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                                暫無活動
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>活動名稱</TableHead>
                                        <TableHead>時間</TableHead>
                                        <TableHead>狀態</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentEvents.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell className="font-medium max-w-[200px] truncate">
                                                {event.title}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">
                                                {event.start_time ? formatDate(event.start_time) : '未設定'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                                                    {event.status === 'published' ? '已發布' : '草稿'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
