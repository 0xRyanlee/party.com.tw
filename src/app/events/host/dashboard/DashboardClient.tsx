'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import { ArrowUpRight, Users, DollarSign, Eye, Activity, TrendingUp, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Event } from '@/lib/mock-data';

// Mock Data for Charts (Monochrome-ish)
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
    { name: 'Impressions', value: 12000, fill: '#171717' }, // neutral-900
    { name: 'Clicks', value: 8000, fill: '#525252' },       // neutral-600
    { name: 'Signups', value: 4000, fill: '#a3a3a3' },      // neutral-400
    { name: 'Paid', value: 2000, fill: '#e5e5e5' },         // neutral-200
];

interface DashboardClientProps {
    events: Event[];
}

export default function DashboardClient({ events }: DashboardClientProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-950">{t('host.dashboard.title')}</h1>
                    <p className="text-neutral-500 font-medium tracking-tight">歡迎回來，檢視您的活動成效。</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-full border-neutral-200 hover:bg-neutral-50 px-5 font-medium">
                        <Filter className="w-4 h-4 mr-2" /> 最近 7 天
                    </Button>
                    <Button className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800 px-6 font-medium shadow-sm transition-all hover:scale-105 active:scale-95">
                        <ArrowUpRight className="w-4 h-4 mr-2" /> 匯出報告
                    </Button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title={t('host.dashboard.totalSales')}
                    value="$45,231"
                    trend="+20.1%"
                    icon={DollarSign}
                />
                <MetricCard
                    title={t('host.dashboard.attendees')}
                    value="2,350"
                    trend="+18.1%"
                    icon={Users}
                />
                <MetricCard
                    title={t('host.dashboard.views')}
                    value="12,234"
                    trend="+19%"
                    icon={Eye}
                />
                <MetricCard
                    title={t('host.activeEvents')}
                    value={events.length.toString()}
                    trend="Active"
                    icon={Activity}
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-8 md:grid-cols-12">
                {/* Main Line Chart (Revenue) */}
                <Card className="col-span-12 lg:col-span-7 rounded-[32px] border-neutral-100 shadow-sm p-2 bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-bold tracking-tight">{t('host.revenueOverview')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#a3a3a3', fontSize: 12, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#a3a3a3', fontSize: 12, fontWeight: 500 }}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                                            padding: '12px 16px'
                                        }}
                                        itemStyle={{ color: '#000', fontWeight: 600 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#000000"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Funnel / Conversion Chart */}
                <Card className="col-span-12 lg:col-span-5 rounded-[32px] border-neutral-100 shadow-sm p-4 bg-white flex flex-col justify-center">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-bold tracking-tight">{t('host.conversionFunnel')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={funnelData}
                                    margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                                    barSize={48}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={1}
                                        tick={(props) => {
                                            const { x, y, payload } = props;
                                            return (
                                                <text x={x - 10} y={y} dy={4} textAnchor="end" fill="#525252" fontSize={13} fontWeight={500}>
                                                    {payload.value}
                                                </text>
                                            );
                                        }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 999, 999, 0]}> {/* Pill shape bars */}
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

            {/* Bottom Section: Activity & Recent Events */}
            <div className="grid gap-8 md:grid-cols-12">
                {/* Live Activity (Dark Mode Card) */}
                <Card className="col-span-12 md:col-span-5 rounded-[32px] border-neutral-100 shadow-xl bg-neutral-950 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-neutral-800/30 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="text-white text-xl font-bold tracking-tight flex items-center gap-2">
                            <Activity className="w-5 h-5 text-neutral-400" />
                            {t('host.liveActivity')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-8 pb-12">
                        <div className="h-48 flex items-center justify-center border border-dashed border-neutral-800 rounded-[24px] bg-neutral-900/50 backdrop-blur-md">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-sm text-neutral-400 font-medium">等待即時數據...</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity List */}
                <Card className="col-span-12 md:col-span-7 rounded-[32px] border-neutral-100 shadow-sm bg-white p-2">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold tracking-tight">{t('host.dashboard.recentActivity')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {events.length > 0 ? (
                            <div className="space-y-2">
                                {events.slice(0, 5).map((event) => (
                                    <div key={event.id} className="group flex items-center justify-between p-4 rounded-3xl hover:bg-neutral-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-14 h-14 rounded-2xl bg-cover bg-center border border-neutral-200 shadow-sm"
                                                style={{ backgroundImage: `url(${event.image})` }}
                                            />
                                            <div className="space-y-1">
                                                <p className="text-base font-bold text-neutral-900 leading-none group-hover:text-black transition-colors">
                                                    {event.title}
                                                </p>
                                                <div className="flex items-center text-sm text-neutral-500 gap-2">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{event.date}</span>
                                                    <span>•</span>
                                                    <span>{event.attendees} 位報名</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="font-semibold text-base text-neutral-900 bg-neutral-100 px-4 py-1.5 rounded-full">
                                            {event.price}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-neutral-400">
                                <p>尚無活動。立即建立您的第一個活動！</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Sub-component for clean code
function MetricCard({ title, value, trend, icon: Icon }: { title: string, value: string, trend: string, icon: any }) {
    return (
        <Card className="rounded-[32px] border-neutral-100 shadow-sm bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-neutral-500">
                    {title}
                </CardTitle>
                <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-neutral-900" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-extrabold tracking-tight text-neutral-900 mt-2">{value}</div>
                <p className="text-sm text-neutral-500 flex items-center mt-2 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-neutral-900" />
                    <span className="text-neutral-900">{trend}</span>
                    <span className="ml-1 text-neutral-400">vs last month</span>
                </p>
            </CardContent>
        </Card>
    );
}
