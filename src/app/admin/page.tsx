"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    Calendar, Users, Image as ImageIcon, Megaphone,
    TrendingUp, Clock, AlertTriangle, CheckCircle,
    ArrowRight, Activity, BarChart3, Ticket
} from "lucide-react";

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
        events: 0,
        publishedEvents: 0,
        users: 0,
        banners: 0,
        announcements: 0,
        reports: 0,
        pendingReports: 0,
        registrations: 0,
    });
    const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
    const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            // Stats queries
            const [
                { count: eventsCount },
                { count: publishedCount },
                { count: usersCount },
                { count: bannersCount },
                { count: announcementsCount },
                { count: reportsCount },
                { count: pendingReportsCount },
                { count: registrationsCount },
            ] = await Promise.all([
                supabase.from("events").select("*", { count: "exact", head: true }),
                supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "published"),
                supabase.from("profiles").select("*", { count: "exact", head: true }),
                supabase.from("banners").select("*", { count: "exact", head: true }).eq("is_active", true),
                supabase.from("announcements").select("*", { count: "exact", head: true }).eq("is_active", true),
                supabase.from("reports").select("*", { count: "exact", head: true }),
                supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
                supabase.from("registrations").select("*", { count: "exact", head: true }),
            ]);

            // Recent data
            const [
                { data: eventsData },
                { data: reportsData },
            ] = await Promise.all([
                supabase.from("events").select("id, title, status, start_time, created_at").order("created_at", { ascending: false }).limit(5),
                supabase.from("reports").select("id, type, category, status, created_at").order("created_at", { ascending: false }).limit(5),
            ]);

            setStats({
                events: eventsCount || 0,
                publishedEvents: publishedCount || 0,
                users: usersCount || 0,
                banners: bannersCount || 0,
                announcements: announcementsCount || 0,
                reports: reportsCount || 0,
                pendingReports: pendingReportsCount || 0,
                registrations: registrationsCount || 0,
            });
            setRecentEvents(eventsData || []);
            setRecentReports(reportsData || []);
            setIsLoading(false);
        };

        fetchData();
    }, [supabase]);

    const primaryStats = [
        {
            label: "活動總數",
            value: stats.events,
            subValue: `${stats.publishedEvents} 已發布`,
            icon: Calendar,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
            href: "/admin/events"
        },
        {
            label: "用戶總數",
            value: stats.users,
            icon: Users,
            color: "text-emerald-500",
            bgColor: "bg-emerald-50",
            href: "#"
        },
        {
            label: "報名人次",
            value: stats.registrations,
            icon: Ticket,
            color: "text-violet-500",
            bgColor: "bg-violet-50",
            href: "#"
        },
        {
            label: "待處理回報",
            value: stats.pendingReports,
            subValue: `共 ${stats.reports} 件`,
            icon: AlertTriangle,
            color: stats.pendingReports > 0 ? "text-amber-500" : "text-gray-400",
            bgColor: stats.pendingReports > 0 ? "bg-amber-50" : "bg-gray-50",
            href: "/admin/reports"
        },
    ];

    const secondaryStats = [
        { label: "啟用橫幅", value: stats.banners, icon: ImageIcon, href: "/admin/banners" },
        { label: "系統公告", value: stats.announcements, icon: Megaphone, href: "/admin/announcements" },
    ];

    const getStatusBadge = (status: string) => {
        const config: Record<string, { variant: "default" | "secondary" | "outline"; className: string }> = {
            published: { variant: "default", className: "bg-green-100 text-green-700 border-green-200" },
            draft: { variant: "outline", className: "text-gray-500" },
            pending: { variant: "outline", className: "text-yellow-600 border-yellow-300 bg-yellow-50" },
            reviewed: { variant: "outline", className: "text-blue-600 border-blue-300 bg-blue-50" },
            resolved: { variant: "outline", className: "text-green-600 border-green-300 bg-green-50" },
        };
        const c = config[status] || { variant: "outline" as const, className: "" };
        return <Badge variant={c.variant} className={c.className}>{status}</Badge>;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("zh-TW", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 頁面標題 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">管理儀表板</h2>
                    <p className="text-gray-500 mt-1">平台概覽與快速操作</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/tests">
                            <Activity className="w-4 h-4 mr-2" />
                            系統測試
                        </Link>
                    </Button>
                </div>
            </div>

            {/* 主要統計卡片 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {primaryStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={stat.label} href={stat.href}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        {stat.label}
                                    </CardTitle>
                                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                        <Icon className={`h-4 w-4 ${stat.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                                    {stat.subValue && (
                                        <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* 次要統計 + 快捷操作 */}
            <div className="grid gap-4 md:grid-cols-3">
                {secondaryStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={stat.label} href={stat.href}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="flex items-center justify-between py-4">
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-medium">{stat.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold">{stat.value}</span>
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
                <Link href="/admin/management">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-violet-50 to-purple-50 border-violet-100">
                        <CardContent className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="h-5 w-5 text-violet-500" />
                                <span className="text-sm font-medium text-violet-700">管理中心</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-violet-400" />
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* 最近活動 + 最近回報 */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* 最近活動 */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">最近活動</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/admin/events">查看全部 <ArrowRight className="w-4 h-4 ml-1" /></Link>
                            </Button>
                        </div>
                        <CardDescription>最近建立的 5 場活動</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentEvents.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">尚無活動</p>
                        ) : (
                            recentEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{event.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {event.start_time ? formatDate(event.start_time) : "未設定時間"}
                                        </p>
                                    </div>
                                    {getStatusBadge(event.status)}
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* 最近回報 */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">最近回報</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/admin/reports">處理回報 <ArrowRight className="w-4 h-4 ml-1" /></Link>
                            </Button>
                        </div>
                        <CardDescription>用戶反饋與檢舉</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentReports.length === 0 ? (
                            <div className="text-center py-4">
                                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">沒有待處理的回報</p>
                            </div>
                        ) : (
                            recentReports.map((report) => (
                                <Link
                                    key={report.id}
                                    href="/admin/reports"
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{report.category}</p>
                                        <p className="text-xs text-gray-500">{formatDate(report.created_at)}</p>
                                    </div>
                                    {getStatusBadge(report.status)}
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
