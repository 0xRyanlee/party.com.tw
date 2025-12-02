'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import { ArrowUpRight, Users, DollarSign, Eye, Activity, TrendingUp, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Event } from '@/lib/mock-data';

// Mock Data for Charts
const salesData = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 2000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
];

const funnelData = [
    { name: 'Impressions', value: 12000, fill: '#10b981' },
    { name: 'Clicks', value: 8000, fill: '#34d399' },
    { name: 'Signups', value: 4000, fill: '#6ee7b7' },
    { name: 'Paid', value: 2000, fill: '#a7f3d0' },
];

interface DashboardClientProps {
    events: Event[];
}

export default function DashboardClient({ events }: DashboardClientProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('host.dashboard.title')}</h1>
                    <p className="text-gray-500 mt-1">歡迎回來！這是您活動的最新動態。</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-full">
                        <Filter className="w-4 h-4 mr-2" /> 最近 7 天
                    </Button>
                    <Button className="rounded-full bg-black text-white hover:bg-gray-800">
                        <ArrowUpRight className="w-4 h-4 mr-2" /> 匯出報告
                    </Button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-[24px] border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            {t('host.dashboard.totalSales')}
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" /> 較上月 +20.1%
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-[24px] border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            {t('host.dashboard.attendees')}
                        </CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+2350</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" /> 較上月 +180.1%
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-[24px] border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            {t('host.dashboard.views')}
                        </CardTitle>
                        <Eye className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12,234</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" /> 較上月 +19%
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-[24px] border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            {t('host.activeEvents')}
                        </CardTitle>
                        <Activity className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.length}</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" /> 共 {events.length} 個活動
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-8 md:grid-cols-7">
                {/* Main Line Chart (Revenue) */}
                <Card className="col-span-4 rounded-[32px] border-gray-100 shadow-sm p-2">
                    <CardHeader>
                        <CardTitle>{t('host.revenueOverview')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickFormatter={(value) => `$${value} `}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Funnel / Conversion Chart */}
                <Card className="col-span-3 rounded-[32px] border-gray-100 shadow-sm p-2">
                    <CardHeader>
                        <CardTitle>{t('host.conversionFunnel')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={funnelData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={80}
                                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" barSize={32} radius={[0, 4, 4, 0]}>
                                        {funnelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lottie Animation Placeholder */}
            <div className="grid gap-8 md:grid-cols-2">
                <Card className="rounded-[32px] border-gray-100 shadow-sm bg-gradient-to-br from-black to-gray-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                    <CardHeader>
                        <CardTitle className="text-white">{t('host.liveActivity')}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="h-48 flex items-center justify-center border-2 border-dashed border-white/20 rounded-2xl bg-white/5 backdrop-blur-sm">
                            <div className="text-center">
                                <Activity className="w-10 h-10 mx-auto mb-2 text-emerald-400 animate-pulse" />
                                <p className="text-sm text-gray-400">動畫佔位符</p>
                                <p className="text-xs text-gray-500 mt-1">即時用戶互動</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[32px] border-gray-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>{t('host.dashboard.recentActivity')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {events.length > 0 ? (
                            <div className="space-y-6">
                                {events.slice(0, 5).map((event) => (
                                    <div key={event.id} className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full bg-cover bg-center mr-4 border border-gray-100"
                                            style={{ backgroundImage: `url(${event.image})` }}
                                        />
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{event.title}</p>
                                            <p className="text-xs text-gray-500">{event.date} • {event.attendees} guests</p>
                                        </div>
                                        <div className="font-medium text-sm text-emerald-600">{event.price}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>尚無活動。立即建立您的第一個活動！</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
