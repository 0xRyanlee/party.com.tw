'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Play,
    Copy,
    Check,
    AlertCircle,
    Clock,
    Globe,
    Database,
    Zap,
    MessageSquare,
    Users,
    Ticket,
    Image as ImageIcon,
    RefreshCw,
    Calendar
} from 'lucide-react';

interface TestResult {
    name: string;
    status: 'idle' | 'running' | 'passed' | 'failed';
    duration?: number;
    error?: string;
    response?: any;
}

interface TestCategory {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    tests: TestConfig[];
}

interface TestConfig {
    id: string;
    name: string;
    description: string;
    testFn: () => Promise<{ success: boolean; data?: any; error?: string }>;
}

// Test configurations
const createTestCategories = (): TestCategory[] => [
    {
        id: 'api',
        name: 'API 健康檢查',
        description: '驗證所有 API 端點是否正常運作',
        icon: Globe,
        tests: [
            {
                id: 'api-events',
                name: 'Events API',
                description: 'GET /api/events',
                testFn: async () => {
                    const res = await fetch('/api/events');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'api-clubs',
                name: 'Clubs API',
                description: 'GET /api/clubs',
                testFn: async () => {
                    const res = await fetch('/api/clubs');
                    return { success: res.status < 500, data: { status: res.status } };
                }
            },
            {
                id: 'api-og',
                name: 'OG Image API',
                description: 'GET /api/og?title=Test',
                testFn: async () => {
                    const res = await fetch('/api/og?title=Test');
                    return {
                        success: res.ok,
                        data: {
                            status: res.status,
                            contentType: res.headers.get('content-type')
                        }
                    };
                }
            },
        ]
    },
    {
        id: 'pages',
        name: '頁面載入測試',
        description: '驗證所有頁面是否正確載入',
        icon: Zap,
        tests: [
            {
                id: 'page-home',
                name: '首頁',
                description: 'GET /',
                testFn: async () => {
                    const res = await fetch('/');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'page-events',
                name: '活動列表',
                description: 'GET /events',
                testFn: async () => {
                    const res = await fetch('/events');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'page-discover',
                name: '探索頁',
                description: 'GET /discover',
                testFn: async () => {
                    const res = await fetch('/discover');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'page-club',
                name: 'Club 頁',
                description: 'GET /club',
                testFn: async () => {
                    const res = await fetch('/club');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'page-settings',
                name: '設定頁',
                description: 'GET /settings',
                testFn: async () => {
                    const res = await fetch('/settings');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
        ]
    },
    {
        id: 'database',
        name: '資料庫連接測試',
        description: '驗證 Supabase 資料庫連接',
        icon: Database,
        tests: [
            {
                id: 'db-events-count',
                name: '活動數量',
                description: 'SELECT count(*) FROM events',
                testFn: async () => {
                    const res = await fetch('/api/events');
                    const data = await res.json();
                    return {
                        success: Array.isArray(data),
                        data: { count: Array.isArray(data) ? data.length : 0 }
                    };
                }
            },
        ]
    },
    {
        id: 'platform',
        name: '平台功能測試',
        description: '驗證核心平台功能',
        icon: Ticket,
        tests: [
            {
                id: 'platform-upload',
                name: '圖片上傳 API',
                description: 'POST /api/upload (OPTIONS)',
                testFn: async () => {
                    const res = await fetch('/api/upload', { method: 'OPTIONS' });
                    return { success: res.status < 500, data: { status: res.status } };
                }
            },
            {
                id: 'platform-tickets',
                name: '票券轉讓 API',
                description: 'POST /api/tickets/transfer-link (OPTIONS)',
                testFn: async () => {
                    const res = await fetch('/api/tickets/transfer-link', { method: 'OPTIONS' });
                    return { success: res.status < 500, data: { status: res.status } };
                }
            },
            {
                id: 'platform-wallet',
                name: '票夾頁面',
                description: 'GET /wallet',
                testFn: async () => {
                    const res = await fetch('/wallet');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'platform-map',
                name: '地圖頁面',
                description: 'GET /map',
                testFn: async () => {
                    const res = await fetch('/map');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
        ]
    },
    {
        id: 'legal',
        name: '法律合規頁面',
        description: '驗證法律文件頁面',
        icon: MessageSquare,
        tests: [
            {
                id: 'legal-terms',
                name: '服務條款',
                description: 'GET /terms',
                testFn: async () => {
                    const res = await fetch('/terms');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'legal-privacy',
                name: '隱私政策',
                description: 'GET /privacy',
                testFn: async () => {
                    const res = await fetch('/privacy');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'legal-disclaimer',
                name: '免責聲明',
                description: 'GET /disclaimer',
                testFn: async () => {
                    const res = await fetch('/disclaimer');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'legal-payment',
                name: '付款條款',
                description: 'GET /payment-terms',
                testFn: async () => {
                    const res = await fetch('/payment-terms');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
        ]
    },
    {
        id: 'admin',
        name: 'Admin 後台',
        description: '驗證管理後台功能',
        icon: Users,
        tests: [
            {
                id: 'admin-dashboard',
                name: 'Admin Dashboard',
                description: 'GET /admin',
                testFn: async () => {
                    const res = await fetch('/admin');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'admin-reports',
                name: 'Admin Reports',
                description: 'GET /admin/reports',
                testFn: async () => {
                    const res = await fetch('/admin/reports');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'admin-banners',
                name: 'Admin Banners',
                description: 'GET /admin/banners',
                testFn: async () => {
                    const res = await fetch('/admin/banners');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'admin-announcements',
                name: 'Admin Announcements',
                description: 'GET /admin/announcements',
                testFn: async () => {
                    const res = await fetch('/admin/announcements');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
        ]
    },
    {
        id: 'host',
        name: 'Host 主辦方功能',
        description: '驗證主辦方相關頁面與功能',
        icon: Zap,
        tests: [
            {
                id: 'host-landing',
                name: '主辦方介紹頁',
                description: 'GET /host',
                testFn: async () => {
                    const res = await fetch('/host');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'host-edit',
                name: '活動編輯頁',
                description: 'GET /host/edit',
                testFn: async () => {
                    const res = await fetch('/host/edit');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'host-dashboard',
                name: '主辦方儀表板',
                description: 'GET /host/dashboard',
                testFn: async () => {
                    const res = await fetch('/host/dashboard');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'host-poster',
                name: '海報生成器',
                description: 'GET /host/poster',
                testFn: async () => {
                    const res = await fetch('/host/poster');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
        ]
    },
    {
        id: 'events-dynamic',
        name: '動態活動頁面',
        description: '隨機抽取活動驗證詳情頁載入',
        icon: Calendar,
        tests: [
            {
                id: 'event-random-1',
                name: '隨機活動 #1',
                description: '從 API 取得隨機活動並驗證詳情頁',
                testFn: async () => {
                    try {
                        const listRes = await fetch('/api/events');
                        const events = await listRes.json();
                        if (!Array.isArray(events) || events.length === 0) {
                            return { success: false, error: '無活動資料' };
                        }
                        const randomEvent = events[Math.floor(Math.random() * events.length)];
                        const detailRes = await fetch(`/events/${randomEvent.id}`);
                        return {
                            success: detailRes.ok,
                            data: {
                                eventId: randomEvent.id,
                                title: randomEvent.title,
                                status: detailRes.status
                            }
                        };
                    } catch (e: any) {
                        return { success: false, error: e.message };
                    }
                }
            },
            {
                id: 'event-random-2',
                name: '隨機活動 #2',
                description: '第二個隨機活動驗證',
                testFn: async () => {
                    try {
                        const listRes = await fetch('/api/events');
                        const events = await listRes.json();
                        if (!Array.isArray(events) || events.length === 0) {
                            return { success: false, error: '無活動資料' };
                        }
                        const randomEvent = events[Math.floor(Math.random() * events.length)];
                        const detailRes = await fetch(`/events/${randomEvent.id}`);
                        return {
                            success: detailRes.ok,
                            data: {
                                eventId: randomEvent.id,
                                title: randomEvent.title,
                                status: detailRes.status
                            }
                        };
                    } catch (e: any) {
                        return { success: false, error: e.message };
                    }
                }
            },
            {
                id: 'event-random-3',
                name: '隨機活動 #3',
                description: '第三個隨機活動驗證',
                testFn: async () => {
                    try {
                        const listRes = await fetch('/api/events');
                        const events = await listRes.json();
                        if (!Array.isArray(events) || events.length === 0) {
                            return { success: false, error: '無活動資料' };
                        }
                        const randomEvent = events[Math.floor(Math.random() * events.length)];
                        const detailRes = await fetch(`/events/${randomEvent.id}`);
                        return {
                            success: detailRes.ok,
                            data: {
                                eventId: randomEvent.id,
                                title: randomEvent.title,
                                status: detailRes.status
                            }
                        };
                    } catch (e: any) {
                        return { success: false, error: e.message };
                    }
                }
            },
        ]
    },
    {
        id: 'navigation',
        name: '導航連結測試',
        description: '驗證所有主要導航連結是否正確',
        icon: Globe,
        tests: [
            {
                id: 'nav-club-create',
                name: 'Club 創建頁',
                description: 'GET /club/create',
                testFn: async () => {
                    const res = await fetch('/club/create');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'nav-redeem',
                name: '兌換碼頁',
                description: 'GET /redeem',
                testFn: async () => {
                    const res = await fetch('/redeem');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'nav-help',
                name: '幫助中心',
                description: 'GET /help',
                testFn: async () => {
                    const res = await fetch('/help');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'nav-contact',
                name: '聯絡我們',
                description: 'GET /contact',
                testFn: async () => {
                    const res = await fetch('/contact');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'nav-following',
                name: '追蹤清單',
                description: 'GET /following',
                testFn: async () => {
                    const res = await fetch('/following');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
            {
                id: 'nav-settings-vendor',
                name: 'Vendor 設定',
                description: 'GET /settings/vendor',
                testFn: async () => {
                    const res = await fetch('/settings/vendor');
                    return { success: res.ok, data: { status: res.status } };
                }
            },
        ]
    },
];


export default function AdminTestDashboard() {
    const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
    const [isRunningAll, setIsRunningAll] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const testCategories = createTestCategories();

    const runTest = useCallback(async (test: TestConfig) => {
        setTestResults(prev => ({
            ...prev,
            [test.id]: { name: test.name, status: 'running' }
        }));

        const startTime = Date.now();
        try {
            const result = await test.testFn();
            const duration = Date.now() - startTime;

            setTestResults(prev => ({
                ...prev,
                [test.id]: {
                    name: test.name,
                    status: result.success ? 'passed' : 'failed',
                    duration,
                    response: result.data,
                    error: result.error
                }
            }));
        } catch (error: any) {
            const duration = Date.now() - startTime;
            setTestResults(prev => ({
                ...prev,
                [test.id]: {
                    name: test.name,
                    status: 'failed',
                    duration,
                    error: error.message
                }
            }));
        }
    }, []);

    const runAllTests = useCallback(async () => {
        setIsRunningAll(true);
        for (const category of testCategories) {
            for (const test of category.tests) {
                await runTest(test);
            }
        }
        setIsRunningAll(false);
    }, [testCategories, runTest]);

    const runCategoryTests = useCallback(async (category: TestCategory) => {
        for (const test of category.tests) {
            await runTest(test);
        }
    }, [runTest]);

    const getResultsSummary = useCallback(() => {
        const results = Object.values(testResults);
        const passed = results.filter(r => r.status === 'passed').length;
        const failed = results.filter(r => r.status === 'failed').length;
        const total = results.length;

        const timestamp = new Date().toLocaleString('zh-TW');

        let summary = `🧪 測試報告 - ${timestamp}\n\n`;
        summary += `✅ 通過: ${passed}\n`;
        summary += `❌ 失敗: ${failed}\n`;
        summary += `📊 總計: ${total}\n\n`;
        summary += `---\n\n`;

        for (const category of testCategories) {
            const categoryResults = category.tests.map(t => testResults[t.id]).filter(Boolean);
            if (categoryResults.length === 0) continue;

            summary += `## ${category.name}\n\n`;
            for (const test of category.tests) {
                const result = testResults[test.id];
                if (!result) continue;

                const icon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏳';
                summary += `${icon} ${result.name}`;
                if (result.duration) summary += ` (${result.duration}ms)`;
                if (result.error) summary += ` - ${result.error}`;
                summary += '\n';
            }
            summary += '\n';
        }

        return summary;
    }, [testResults, testCategories]);

    const copyToClipboard = useCallback(async (id: string, text: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    const getStatusIcon = (status: TestResult['status']) => {
        switch (status) {
            case 'running':
                return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
            case 'passed':
                return <Check className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const passedCount = Object.values(testResults).filter(r => r.status === 'passed').length;
    const failedCount = Object.values(testResults).filter(r => r.status === 'failed').length;
    const totalTests = testCategories.reduce((sum, cat) => sum + cat.tests.length, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">測試儀表板</h2>
                    <p className="text-gray-500">執行自動化測試並分享結果</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={runAllTests}
                        disabled={isRunningAll}
                        className="gap-2"
                    >
                        {isRunningAll ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                        執行全部測試
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => copyToClipboard('summary', getResultsSummary())}
                        disabled={Object.keys(testResults).length === 0}
                        className="gap-2"
                    >
                        {copiedId === 'summary' ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                        複製報告
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{passedCount}</div>
                        <p className="text-sm text-gray-500">通過</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                        <p className="text-sm text-gray-500">失敗</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{Object.keys(testResults).length}</div>
                        <p className="text-sm text-gray-500">已執行</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-gray-400">{totalTests}</div>
                        <p className="text-sm text-gray-500">總測試數</p>
                    </CardContent>
                </Card>
            </div>

            {/* Test Categories */}
            {testCategories.map((category) => {
                const Icon = category.icon;
                return (
                    <Card key={category.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Icon className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <CardTitle>{category.name}</CardTitle>
                                        <CardDescription>{category.description}</CardDescription>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => runCategoryTests(category)}
                                    className="gap-2"
                                >
                                    <Play className="w-3 h-3" />
                                    執行
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {category.tests.map((test) => {
                                    const result = testResults[test.id];
                                    return (
                                        <div
                                            key={test.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                {result ? getStatusIcon(result.status) : <Clock className="w-4 h-4 text-gray-300" />}
                                                <div>
                                                    <div className="font-medium text-sm">{test.name}</div>
                                                    <div className="text-xs text-gray-500">{test.description}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {result?.duration && (
                                                    <span className="text-xs text-gray-400">{result.duration}ms</span>
                                                )}
                                                {result?.response && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(test.id, JSON.stringify(result.response, null, 2))}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        {copiedId === test.id ? (
                                                            <Check className="w-3 h-3" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => runTest(test)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <Play className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {/* CLI Commands */}
            <Card>
                <CardHeader>
                    <CardTitle>CLI 測試指令</CardTitle>
                    <CardDescription>在終端機執行完整測試套件</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[
                        { label: 'E2E 測試 (Playwright)', command: 'npx playwright test --project=chromium' },
                        { label: '鏈接檢查', command: 'node scripts/check-links.js' },
                        { label: '類型檢查', command: 'npx tsc --noEmit' },
                        { label: 'Lint 檢查', command: 'npm run lint' },
                        { label: '建置測試', command: 'npm run build' },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-3 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm">
                            <div>
                                <span className="text-gray-400"># {item.label}</span>
                                <br />
                                <span className="text-green-400">$ </span>{item.command}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(item.command, item.command)}
                                className="text-gray-400 hover:text-white"
                            >
                                {copiedId === item.command ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
