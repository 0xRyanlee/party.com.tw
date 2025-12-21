'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    History, Plus, Trash2, Edit2, Save, RefreshCw,
    GitCommit, Rocket, Bug, Sparkles, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

interface VersionUpdate {
    id: string;
    version: string;
    title: string;
    description: string;
    type: 'feature' | 'fix' | 'improvement' | 'breaking';
    is_published: boolean;
    created_at: string;
}

const typeConfig: Record<string, { label: string; icon: typeof Sparkles; color: string }> = {
    feature: { label: '新功能', icon: Sparkles, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    fix: { label: '修復', icon: Bug, color: 'bg-green-100 text-green-600 border-green-200' },
    improvement: { label: '優化', icon: Rocket, color: 'bg-purple-100 text-purple-600 border-purple-200' },
    breaking: { label: '重大變更', icon: AlertCircle, color: 'bg-red-100 text-red-600 border-red-200' },
};

export default function VersionsPage() {
    const [updates, setUpdates] = useState<VersionUpdate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState<VersionUpdate | null>(null);

    // Form state
    const [formVersion, setFormVersion] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formType, setFormType] = useState<VersionUpdate['type']>('feature');

    // 載入數據
    const loadVersions = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/versions');
            const data = await res.json();
            setUpdates(data.versions || []);
        } catch (error) {
            console.error('Load versions error:', error);
            toast.error('載入失敗');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVersions();
    }, [loadVersions]);

    const resetForm = () => {
        setFormVersion('');
        setFormTitle('');
        setFormDescription('');
        setFormType('feature');
        setEditingUpdate(null);
    };

    const openCreateDialog = () => {
        resetForm();
        if (updates.length > 0) {
            const latestVersion = updates[0].version;
            const parts = latestVersion.split('.');
            parts[2] = (parseInt(parts[2]) + 1).toString();
            setFormVersion(parts.join('.'));
        } else {
            setFormVersion('1.0.0');
        }
        setDialogOpen(true);
    };

    const openEditDialog = (update: VersionUpdate) => {
        setEditingUpdate(update);
        setFormVersion(update.version);
        setFormTitle(update.title);
        setFormDescription(update.description);
        setFormType(update.type);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formVersion.trim() || !formTitle.trim()) {
            toast.error('請填寫版本號和標題');
            return;
        }

        try {
            if (editingUpdate) {
                await fetch('/api/admin/versions', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingUpdate.id,
                        version: formVersion,
                        title: formTitle,
                        description: formDescription,
                        type: formType,
                    }),
                });
                toast.success('版本更新已修改');
            } else {
                await fetch('/api/admin/versions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        version: formVersion,
                        title: formTitle,
                        description: formDescription,
                        type: formType,
                        is_published: false,
                    }),
                });
                toast.success('版本更新已新增');
            }

            setDialogOpen(false);
            resetForm();
            loadVersions();
        } catch (error) {
            console.error('Save error:', error);
            toast.error('保存失敗');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/admin/versions?id=${id}`, { method: 'DELETE' });
            toast.success('版本更新已刪除');
            loadVersions();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('刪除失敗');
        }
    };

    const togglePublish = async (update: VersionUpdate) => {
        try {
            await fetch('/api/admin/versions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: update.id,
                    is_published: !update.is_published,
                }),
            });
            toast.success(update.is_published ? '已取消發布' : '已發布');
            loadVersions();
        } catch (error) {
            console.error('Toggle publish error:', error);
            toast.error('操作失敗');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <History className="w-6 h-6" />
                        版本更新
                    </h2>
                    <p className="text-zinc-500">管理平台版本更新記錄（已發布的會顯示在用戶端）</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadVersions} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        刷新
                    </Button>
                    <Button size="sm" onClick={openCreateDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        新增版本
                    </Button>
                </div>
            </div>

            {/* Updates Timeline */}
            {isLoading ? (
                <div className="text-center py-12 text-zinc-500">載入中...</div>
            ) : updates.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12 text-zinc-500">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>暫無版本記錄</p>
                        <p className="text-sm mt-2">請先執行數據庫 Migration</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-200" />

                    <div className="space-y-4">
                        {updates.map((update) => {
                            const config = typeConfig[update.type] || typeConfig.feature;
                            const Icon = config.icon;

                            return (
                                <Card key={update.id} className={`ml-8 ${!update.is_published ? 'opacity-60' : ''}`}>
                                    <div className="absolute -left-4 w-8 h-8 rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center">
                                        <GitCommit className="w-4 h-4 text-zinc-400" />
                                    </div>
                                    <CardContent className="py-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <code className="font-mono text-sm font-bold">v{update.version}</code>
                                                    <Badge variant="outline" className={config.color}>
                                                        <Icon className="w-3 h-3 mr-1" />
                                                        {config.label}
                                                    </Badge>
                                                    {!update.is_published && (
                                                        <Badge variant="outline" className="bg-zinc-100 text-zinc-500">草稿</Badge>
                                                    )}
                                                </div>
                                                <p className="font-medium">{update.title}</p>
                                                <p className="text-sm text-zinc-500 mt-1">{update.description}</p>
                                                <p className="text-xs text-zinc-400 mt-2">{formatDate(update.created_at)}</p>
                                            </div>
                                            <div className="flex items-center gap-1 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => togglePublish(update)}
                                                    className="h-7 text-xs"
                                                >
                                                    {update.is_published ? '取消發布' : '發布'}
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => openEditDialog(update)} className="h-7 w-7 p-0">
                                                    <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleDelete(update.id)} className="h-7 w-7 p-0 text-red-500">
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUpdate ? '編輯版本' : '新增版本'}</DialogTitle>
                        <DialogDescription>記錄平台更新內容</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">版本號</label>
                                <Input
                                    value={formVersion}
                                    onChange={(e) => setFormVersion(e.target.value)}
                                    placeholder="1.2.0"
                                    className="mt-1 font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">類型</label>
                                <div className="flex gap-1 mt-1 flex-wrap">
                                    {Object.entries(typeConfig).map(([key, { label }]) => (
                                        <button
                                            key={key}
                                            onClick={() => setFormType(key as VersionUpdate['type'])}
                                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${formType === key
                                                ? 'bg-zinc-900 text-white border-zinc-900'
                                                : 'bg-white border-zinc-200 hover:border-zinc-400'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">標題</label>
                            <Input
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="版本更新標題"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">描述</label>
                            <Textarea
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                placeholder="詳細描述更新內容..."
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
