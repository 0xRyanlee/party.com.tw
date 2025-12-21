'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    FileText, RefreshCw, Search, Calendar, User,
    Database, Shield, Settings, AlertTriangle, GitCommit
} from 'lucide-react';

interface LogEntry {
    id: string;
    type: 'version' | 'milestone' | 'admin' | 'database' | 'system';
    action: string;
    user_name: string | null;
    details: string;
    created_at: string;
}

// 模擬日誌數據（實際應從資料庫獲取）
const mockLogs: LogEntry[] = [
    {
        id: '1',
        type: 'version',
        action: '版本更新',
        user_name: null,
        details: 'v2.2.0 - 活動 UI/UX 優化與行程時間線',
        created_at: new Date().toISOString(),
    },
    {
        id: '2',
        type: 'admin',
        action: 'KOL 審核通過',
        user_name: 'Admin',
        details: '用戶 user@example.com 的 KOL 認證已通過',
        created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: '3',
        type: 'milestone',
        action: '里程碑達成',
        user_name: null,
        details: '平台用戶數突破 100 人',
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '4',
        type: 'database',
        action: 'Migration 執行',
        user_name: null,
        details: '20251221003800_add_event_requirements.sql 已推送',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
        id: '5',
        type: 'system',
        action: '系統警告',
        user_name: null,
        details: '敏感詞觸發：活動標題包含高危關鍵詞',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
];

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
    const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(mockLogs);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    useEffect(() => {
        let result = logs;

        if (searchQuery) {
            result = result.filter(log =>
                log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.details.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (typeFilter !== 'all') {
            result = result.filter(log => log.type === typeFilter);
        }

        setFilteredLogs(result);
    }, [logs, searchQuery, typeFilter]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'version':
                return <GitCommit className="w-4 h-4 text-blue-500" />;
            case 'milestone':
                return <Calendar className="w-4 h-4 text-green-500" />;
            case 'admin':
                return <Shield className="w-4 h-4 text-purple-500" />;
            case 'database':
                return <Database className="w-4 h-4 text-orange-500" />;
            case 'system':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            default:
                return <Settings className="w-4 h-4 text-gray-500" />;
        }
    };

    const getTypeBadge = (type: string) => {
        const styles: Record<string, string> = {
            version: 'bg-blue-50 text-blue-600 border-blue-200',
            milestone: 'bg-green-50 text-green-600 border-green-200',
            admin: 'bg-purple-50 text-purple-600 border-purple-200',
            database: 'bg-orange-50 text-orange-600 border-orange-200',
            system: 'bg-red-50 text-red-600 border-red-200',
        };
        const labels: Record<string, string> = {
            version: '版本',
            milestone: '里程碑',
            admin: '管理員',
            database: '資料庫',
            system: '系統',
        };
        return (
            <Badge variant="outline" className={styles[type] || ''}>
                {labels[type] || type}
            </Badge>
        );
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)} 分鐘前`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)} 小時前`;
        } else {
            return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
    };

    const typeOptions = [
        { value: 'all', label: '全部' },
        { value: 'version', label: '版本更新' },
        { value: 'milestone', label: '里程碑' },
        { value: 'admin', label: '管理員操作' },
        { value: 'database', label: '資料庫' },
        { value: 'system', label: '系統事件' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6" />
                        操作日誌
                    </h2>
                    <p className="text-gray-500">平台所有操作與事件記錄</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsLoading(true)} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    刷新
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="搜尋日誌..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                    {typeOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setTypeFilter(opt.value)}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${typeFilter === opt.value
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-600 hover:text-black'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-5">
                {typeOptions.filter(o => o.value !== 'all').map(opt => (
                    <Card key={opt.value}>
                        <CardContent className="pt-4 pb-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                {getTypeIcon(opt.value)}
                                <span className="text-xl font-bold">
                                    {logs.filter(l => l.type === opt.value).length}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">{opt.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Logs List */}
            <Card>
                <CardHeader>
                    <CardTitle>日誌列表</CardTitle>
                    <CardDescription>顯示 {filteredLogs.length} 筆記錄</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                            >
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    {getTypeIcon(log.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium">{log.action}</p>
                                        {getTypeBadge(log.type)}
                                    </div>
                                    <p className="text-sm text-gray-600">{log.details}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                        {log.user_name && (
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {log.user_name}
                                            </span>
                                        )}
                                        <span>{formatTime(log.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
