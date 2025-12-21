"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import {
    Calendar, Users, TrendingUp, TrendingDown,
    ArrowUpRight, Activity, CreditCard, DollarSign, Download
} from "lucide-react";

interface RecentEvent {
    id: string;
    title: string;
    status: string;
    start_time: string | null;
    created_at: string;
}

interface RecentUser {
    id: string;
    display_name: string;
    email: string;
    avatar_url: string | null;
    created_at: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        events: 0,
        publishedEvents: 0,
        users: 0,
        registrations: 0,
        reports: 0,
        pendingReports: 0,
        weeklyGrowth: { events: 0, users: 0, registrations: 0 },
    });
    const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const [
                { count: eventsCount },
                { count: publishedCount },
                { count: usersCount },
                { count: registrationsCount },
                { count: reportsCount },
                { count: pendingReportsCount },
                { count: weeklyEvents },
                { count: weeklyUsers },
                { count: weeklyRegistrations },
                { data: eventsData },
                { data: usersData },
            ] = await Promise.all([
                supabase.from("events").select("*", { count: "exact", head: true }),
                supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "published"),
                supabase.from("profiles").select("*", { count: "exact", head: true }),
                supabase.from("event_registrations").select("*", { count: "exact", head: true }),
                supabase.from("reports").select("*", { count: "exact", head: true }),
                supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
                supabase.from("events").select("*", { count: "exact", head: true }).gte("created_at", oneWeekAgo.toISOString()),
                supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", oneWeekAgo.toISOString()),
                supabase.from("event_registrations").select("*", { count: "exact", head: true }).gte("created_at", oneWeekAgo.toISOString()),
                supabase.from("events").select("id, title, status, start_time, created_at").order("created_at", { ascending: false }).limit(5),
                supabase.from("profiles").select("id, display_name, email, avatar_url, created_at").order("created_at", { ascending: false }).limit(5),
            ]);

            setStats({
                events: eventsCount || 0,
                publishedEvents: publishedCount || 0,
                users: usersCount || 0,
                registrations: registrationsCount || 0,
                reports: reportsCount || 0,
                pendingReports: pendingReportsCount || 0,
                weeklyGrowth: {
                    events: weeklyEvents || 0,
                    users: weeklyUsers || 0,
                    registrations: weeklyRegistrations || 0,
                },
            });
            setRecentEvents(eventsData || []);
            setRecentUsers(usersData || []);
            setIsLoading(false);
        };

        fetchData();
    }, [supabase]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("zh-TW", {
            month: "short",
            day: "numeric",
        });
    };

    const formatRelativeTime = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins} 分鐘前`;
        if (diffHours < 24) return `${diffHours} 小時前`;
        return `${diffDays} 天前`;
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        下載報告
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">總覽</TabsTrigger>
                    <TabsTrigger value="analytics">數據分析</TabsTrigger>
                    <TabsTrigger value="reports">回報處理</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">總營收</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$0</div>
                                <p className="text-xs text-muted-foreground">
                                    尚未開通付費功能
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">用戶數</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+{stats.users}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    {stats.weeklyGrowth.users > 0 ? (
                                        <>
                                            <TrendingUp className="h-3 w-3 text-green-500" />
                                            <span className="text-green-500">+{stats.weeklyGrowth.users}</span>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">本週無新增</span>
                                    )}
                                    {" "}本週
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">活動數</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.events}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span className="text-green-500">+{stats.weeklyGrowth.events}</span> 本週新增
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">報名數</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.registrations}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span className="text-green-500">+{stats.weeklyGrowth.registrations}</span> 本週新增
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        {/* Recent Events */}
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>最近活動</CardTitle>
                                <CardDescription>
                                    平台上最新發布的活動
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentEvents.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">暫無活動</p>
                                    ) : (
                                        recentEvents.map((event) => (
                                            <Link
                                                key={event.id}
                                                href={`/events/${event.id}`}
                                                className="flex items-center gap-4 rounded-md p-2 hover:bg-accent transition-colors"
                                            >
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium leading-none truncate">
                                                        {event.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {event.start_time ? formatDate(event.start_time) : "未設定時間"}
                                                    </p>
                                                </div>
                                                <Badge variant={event.status === "published" ? "default" : "secondary"}>
                                                    {event.status === "published" ? "已發布" : "草稿"}
                                                </Badge>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Users */}
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>新加入用戶</CardTitle>
                                <CardDescription>
                                    最近註冊的用戶
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentUsers.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">暫無新用戶</p>
                                    ) : (
                                        recentUsers.map((user) => (
                                            <div key={user.id} className="flex items-center gap-4">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback>
                                                        {(user.display_name || user.email || "U")[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {user.display_name || "未命名"}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatRelativeTime(user.created_at)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Link href="/admin/events">
                            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium">活動管理</CardTitle>
                                    <ArrowUpRight className="h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        管理平台上的所有活動
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/admin/users">
                            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium">用戶管理</CardTitle>
                                    <ArrowUpRight className="h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        查看和管理用戶帳號
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/admin/reports">
                            <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium">待處理回報</CardTitle>
                                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                        {stats.pendingReports}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.pendingReports > 0 ? `有 ${stats.pendingReports} 件待處理` : "目前沒有待處理回報"}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>數據分析</CardTitle>
                            <CardDescription>查看詳細的平台數據分析</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <Activity className="w-12 h-12 mx-auto text-muted-foreground" />
                                <div>
                                    <p className="text-lg font-medium">前往數據儀表板</p>
                                    <p className="text-sm text-muted-foreground">查看完整的趨勢圖表和數據分析</p>
                                </div>
                                <Button asChild>
                                    <Link href="/admin/analytics">
                                        開啟數據儀表板
                                        <ArrowUpRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>回報處理</CardTitle>
                            <CardDescription>管理用戶檢舉和回報</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="flex items-center justify-center">
                                    <Badge variant="outline" className="text-2xl px-4 py-2 bg-orange-100 text-orange-700 border-orange-300">
                                        {stats.pendingReports}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-lg font-medium">待處理回報</p>
                                    <p className="text-sm text-muted-foreground">共 {stats.reports} 件回報記錄</p>
                                </div>
                                <Button asChild>
                                    <Link href="/admin/reports">
                                        前往處理
                                        <ArrowUpRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
