"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Sparkles, Bug, Rocket, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface VersionUpdate {
    id: string;
    version: string;
    title: string;
    description: string;
    type: 'feature' | 'fix' | 'improvement' | 'breaking';
    created_at: string;
}

const typeConfig: Record<string, { label: string; icon: typeof Sparkles; color: string }> = {
    feature: { label: '新功能', icon: Sparkles, color: 'bg-emerald-50 text-emerald-600' },
    fix: { label: '修復', icon: Bug, color: 'bg-blue-50 text-blue-600' },
    improvement: { label: '優化', icon: Rocket, color: 'bg-purple-50 text-purple-600' },
    breaking: { label: '重大變更', icon: AlertCircle, color: 'bg-red-50 text-red-600' },
};

// 備用靜態數據（數據庫未連接時顯示）
const fallbackLogs = [
    {
        id: '1',
        version: "2.2.0",
        title: "活動 UI/UX 優化與行程時間線",
        description: "活動詳情頁移除重複報名按鈕、緊湊化佈局。新增「行程時間線」頁面。",
        type: 'feature' as const,
        created_at: new Date().toISOString(),
    },
    {
        id: '2',
        version: "2.1.0",
        title: "俱樂部系統與 KOL 身份驗證",
        description: "俱樂部創建動效。KOL 身份申請頁面。",
        type: 'feature' as const,
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '3',
        version: "2.0.0",
        title: "票夾與導航重構",
        description: "全新導航結構。票夾頁面管理所有票券。",
        type: 'feature' as const,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
];

export default function ChangelogPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<VersionUpdate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadVersions = async () => {
            try {
                const res = await fetch('/api/admin/versions?published=true');
                const data = await res.json();
                if (data.versions && data.versions.length > 0) {
                    setLogs(data.versions);
                } else {
                    setLogs(fallbackLogs);
                }
            } catch (error) {
                console.error('Load versions error:', error);
                setLogs(fallbackLogs);
            } finally {
                setIsLoading(false);
            }
        };

        loadVersions();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <main className="min-h-screen bg-gray-50 text-black pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">功能更新日誌</h1>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold">What's New</h2>
                    <p className="text-gray-500">最新功能與改進。</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">載入中...</div>
                ) : (
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                        {logs.map((log, index) => {
                            const config = typeConfig[log.type] || typeConfig.feature;
                            const Icon = config.icon;

                            return (
                                <div key={log.id} className="relative flex items-start group is-active">
                                    <div className="absolute left-0 ml-5 -translate-x-1/2 mt-1.5 w-4 h-4 rounded-full border-2 border-white bg-gray-200 group-[.is-active]:bg-emerald-500 group-[.is-active]:shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" />

                                    <div className="ml-12 w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="default" className="rounded-full">
                                                    v{log.version}
                                                </Badge>
                                                <Badge variant="outline" className={`rounded-full ${config.color}`}>
                                                    <Icon className="w-3 h-3 mr-1" />
                                                    {config.label}
                                                </Badge>
                                                <span className="text-sm text-gray-400 font-mono">{formatDate(log.created_at)}</span>
                                            </div>
                                            {index === 0 && (
                                                <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                                    <Sparkles className="w-3 h-3 mr-1" /> Latest
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold mb-2">{log.title}</h3>
                                        <p className="text-gray-600 text-sm">{log.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
