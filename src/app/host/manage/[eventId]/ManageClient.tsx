'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Share2, XCircle, CheckCircle, Users, UserCheck, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import RegistrationsTab from './RegistrationsTab';
import CheckInTab from './CheckInTab';

interface Event {
    id: string;
    title: string;
    status: string;
    start_time: string;
    end_time: string;
    venue_name: string;
    created_at: string;
    [key: string]: any;
}

interface Stats {
    registered: number;
    capacity: number;
    checkedIn: number;
    waitlist: number;
}

export default function ManageClient({
    event,
    stats,
}: {
    event: Event;
    stats: Stats;
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-neutral-900 text-white';
            case 'draft':
                return 'bg-neutral-100 text-neutral-600';
            case 'closed':
                return 'bg-neutral-200 text-neutral-700';
            case 'canceled':
                return 'bg-red-50 text-red-600';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'published':
                return '已發布';
            case 'draft':
                return '草稿';
            case 'closed':
                return '已結束';
            case 'canceled':
                return '已取消';
            default:
                return status;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/host/dashboard')}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">{event.title}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                        {getStatusText(event.status)}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {new Date(event.start_time).toLocaleDateString('zh-TW')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/host/edit?id=${event.id}`}>
                                <Button variant="outline">
                                    <Edit className="w-4 h-4 mr-2" />
                                    編輯活動
                                </Button>
                            </Link>
                            <Link href={`/events/${event.id}`}>
                                <Button variant="outline">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    查看頁面
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-4 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-8 p-1 bg-neutral-100/50 rounded-full">
                        <TabsTrigger value="overview">概覽</TabsTrigger>
                        <TabsTrigger value="registrations">報名管理</TabsTrigger>
                        <TabsTrigger value="checkin">簽到管理</TabsTrigger>
                        <TabsTrigger value="share">分享推廣</TabsTrigger>
                        <TabsTrigger value="analytics">數據分析</TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Overview */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-neutral-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-neutral-500 font-medium">報名人數</span>
                                    <Users className="w-5 h-5 text-neutral-400" />
                                </div>
                                <div className="text-3xl font-extrabold tracking-tight text-neutral-900">
                                    {stats.registered}
                                    <span className="text-lg text-neutral-400 ml-1 font-medium">
                                        / {stats.capacity || '∞'}
                                    </span>
                                </div>
                                {stats.capacity > 0 && (
                                    <div className="mt-4 w-full bg-neutral-100 rounded-full h-2">
                                        <div
                                            className="bg-neutral-900 h-2 rounded-full"
                                            style={{
                                                width: `${Math.min((stats.registered / stats.capacity) * 100, 100)}%`,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-neutral-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-neutral-500 font-medium">已簽到</span>
                                    <UserCheck className="w-5 h-5 text-neutral-400" />
                                </div>
                                <div className="text-3xl font-extrabold tracking-tight text-neutral-900">
                                    {stats.checkedIn}
                                    <span className="text-lg text-neutral-400 ml-1 font-medium">
                                        / {stats.registered}
                                    </span>
                                </div>
                                {stats.registered > 0 && (
                                    <div className="mt-4 text-sm text-neutral-500">
                                        簽到率 {Math.round((stats.checkedIn / stats.registered) * 100)}%
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-neutral-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-neutral-500 font-medium">候補名單</span>
                                    <Clock className="w-5 h-5 text-neutral-400" />
                                </div>
                                <div className="text-3xl font-extrabold tracking-tight text-neutral-900">{stats.waitlist}</div>
                                <div className="mt-4 text-sm text-neutral-500">等待中</div>
                            </div>

                            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-neutral-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-neutral-500 font-medium">活動狀態</span>
                                    <TrendingUp className="w-5 h-5 text-neutral-400" />
                                </div>
                                <div className="text-lg font-bold mt-1 text-neutral-900">
                                    {getStatusText(event.status)}
                                </div>
                                <div className="mt-4 text-sm text-neutral-500">
                                    {new Date(event.start_time).toLocaleDateString('zh-TW', {
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white p-6 rounded-[16px] shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4">快速操作</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <Link href={`/host/edit?id=${event.id}`}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Edit className="w-4 h-4 mr-2" />
                                        編輯活動資訊
                                    </Button>
                                </Link>
                                {event.status === 'draft' && (
                                    <Button variant="outline" className="w-full justify-start">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        發布活動
                                    </Button>
                                )}
                                {event.status === 'published' && (
                                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        取消活動
                                    </Button>
                                )}
                                <Button variant="outline" className="w-full justify-start">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    分享活動
                                </Button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white p-6 rounded-[16px] shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4">活動時間軸</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-2 h-2 rounded-full bg-gray-400 mt-2" />
                                    <div>
                                        <div className="font-medium">創建時間</div>
                                        <div className="text-sm text-gray-600">
                                            {new Date(event.created_at).toLocaleString('zh-TW')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2" />
                                    <div>
                                        <div className="font-medium">活動開始</div>
                                        <div className="text-sm text-gray-600">
                                            {new Date(event.start_time).toLocaleString('zh-TW')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                                    <div>
                                        <div className="font-medium">活動結束</div>
                                        <div className="text-sm text-gray-600">
                                            {new Date(event.end_time).toLocaleString('zh-TW')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Registrations Management */}
                    <TabsContent value="registrations" className="space-y-6">
                        <RegistrationsTab eventId={event.id} />
                    </TabsContent>

                    {/* Tab 3: Check-in */}
                    <TabsContent value="checkin" className="space-y-6">
                        <CheckInTab eventId={event.id} />
                    </TabsContent>

                    {/* Tab 4: Share & Promotion */}
                    <TabsContent value="share" className="space-y-6">
                        {/* Share Links */}
                        <div className="bg-white p-6 rounded-[16px] shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4">分享連結</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">活動頁面連結</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/events/${event.id}`}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        />
                                        <Button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`);
                                                alert('連結已複製！');
                                            }}
                                        >
                                            複製
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">活動代碼</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={event.id.substring(0, 8).toUpperCase()}
                                            className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg"
                                        />
                                        <Button
                                            onClick={() => {
                                                navigator.clipboard.writeText(event.id.substring(0, 8).toUpperCase());
                                                alert('代碼已複製！');
                                            }}
                                        >
                                            複製
                                        </Button>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        參與者可使用此代碼快速找到活動
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="bg-white p-6 rounded-[16px] shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4">QR Code</h3>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="bg-gray-100 p-8 rounded-lg flex items-center justify-center">
                                        <div className="w-48 h-48 bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
                                            <div className="text-center text-gray-400">
                                                <div className="text-4xl mb-2 text-neutral-300">QR</div>
                                                <div className="text-sm">QR Code</div>
                                                <div className="text-xs mt-1">即將推出</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <p className="text-gray-600">
                                        掃描 QR Code 即可快速訪問活動頁面，適合印刷在海報、傳單或展示在現場。
                                    </p>
                                    <div className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start" disabled>
                                            <Share2 className="w-4 h-4 mr-2" />
                                            下載 QR Code (PNG)
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" disabled>
                                            <Share2 className="w-4 h-4 mr-2" />
                                            下載 QR Code (SVG)
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        * QR Code 生成功能即將推出
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Share */}
                        <div className="bg-white p-6 rounded-[16px] shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4">社交媒體分享</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        const url = `${window.location.origin}/events/${event.id}`;
                                        const text = `${event.title} - ${event.venue_name}`;
                                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                    }}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    分享到 Facebook
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        const url = `${window.location.origin}/events/${event.id}`;
                                        const text = `${event.title}`;
                                        window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text + ' ' + url)}`, '_blank');
                                    }}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="#00C300" viewBox="0 0 24 24">
                                        <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.604.391.084.922.258 1.057.592.121.303.079.778.038 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.992 2.61-4.128 2.61-6.288z" />
                                    </svg>
                                    分享到 Line
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        const url = `${window.location.origin}/events/${event.id}`;
                                        const text = `${event.title}`;
                                        navigator.clipboard.writeText(`${text}\n${url}`);
                                        alert('連結已複製到剪貼簿！');
                                    }}
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    複製分享文字
                                </Button>
                            </div>
                        </div>

                        {/* Poster Templates */}
                        <div className="bg-white p-6 rounded-[16px] shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4">海報模板</h3>
                            <p className="text-gray-600 mb-4">
                                選擇模板自動生成活動海報，適合印刷或在社交媒體分享。
                            </p>
                            <div className="grid md:grid-cols-3 gap-4">
                                {['簡約風格', '活潑風格', '專業風格'].map((template, idx) => (
                                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-purple-600 cursor-pointer transition-colors">
                                        <div className="aspect-[3/4] bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-3 flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <div className="text-2xl mb-1">🎨</div>
                                                <div className="text-sm">{template}</div>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full" size="sm" disabled>
                                            使用此模板
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-4">
                                * 海報生成功能即將推出
                            </p>
                        </div>
                    </TabsContent>

                    {/* Tab 5: Analytics */}
                    <TabsContent value="analytics" className="space-y-6">
                        {/* Registration Trend */}
                        <div className="bg-white p-6 rounded-[16px] shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4">報名趨勢</h3>
                            <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
                                <div className="text-center text-gray-400">
                                    <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                                    <p className="text-sm">報名人數趨勢圖</p>
                                    <p className="text-xs mt-1">需要整合 Recharts</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4">
                                * 圖表功能即將推出，將顯示每日報名人數變化
                            </p>
                        </div>

                        {/* Conversion Funnel */}
                        <div className="bg-white p-6 rounded-[16px] shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4">轉化漏斗</h3>
                            <div className="space-y-3">
                                {[
                                    { label: '頁面瀏覽', value: 1000, percentage: 100, color: 'bg-purple-600' },
                                    { label: '點擊報名', value: 500, percentage: 50, color: 'bg-purple-500' },
                                    { label: '完成報名', value: 300, percentage: 30, color: 'bg-purple-400' },
                                    { label: '實際簽到', value: 250, percentage: 25, color: 'bg-purple-300' },
                                ].map((step, idx) => (
                                    <div key={idx}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">{step.label}</span>
                                            <span className="text-sm text-gray-600">
                                                {step.value} ({step.percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`${step.color} h-3 rounded-full transition-all`}
                                                style={{ width: `${step.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-4">
                                * 數據為示例，實際數據需要整合追蹤系統
                            </p>
                        </div>

                        {/* Traffic Sources */}
                        <div className="bg-white p-6 rounded-[16px] shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4">流量來源</h3>
                            <div className="space-y-4">
                                {[
                                    { source: '直接訪問', visits: 450, percentage: 45, color: 'bg-blue-600' },
                                    { source: 'Facebook', visits: 300, percentage: 30, color: 'bg-indigo-600' },
                                    { source: 'Line', visits: 150, percentage: 15, color: 'bg-green-600' },
                                    { source: '推薦連結', visits: 100, percentage: 10, color: 'bg-pink-600' },
                                ].map((source, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">{source.source}</span>
                                                <span className="text-sm text-gray-600">{source.visits} 次</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`${source.color} h-2 rounded-full`}
                                                    style={{ width: `${source.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-600 w-12 text-right">
                                            {source.percentage}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-4">
                                * 數據為示例，實際數據需要整合 Google Analytics 或其他追蹤工具
                            </p>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-[16px] border border-purple-100">
                                <div className="text-sm text-purple-700 font-medium mb-1">平均停留時間</div>
                                <div className="text-3xl font-bold text-purple-900">2:34</div>
                                <div className="text-xs text-purple-600 mt-1">分鐘</div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-[16px] border border-blue-100">
                                <div className="text-sm text-blue-700 font-medium mb-1">報名轉化率</div>
                                <div className="text-3xl font-bold text-blue-900">30%</div>
                                <div className="text-xs text-blue-600 mt-1">瀏覽 → 報名</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-[16px] border border-green-100">
                                <div className="text-sm text-green-700 font-medium mb-1">簽到出席率</div>
                                <div className="text-3xl font-bold text-green-900">83%</div>
                                <div className="text-xs text-green-600 mt-1">報名 → 簽到</div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
