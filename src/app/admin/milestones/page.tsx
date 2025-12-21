'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Target, Plus, Trash2, Edit2, Save,
    RefreshCw, CheckCircle, Circle
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

interface Milestone {
    id: string;
    title: string;
    description: string;
    category: 'user' | 'content' | 'tech' | 'business';
    target_value: number;
    current_value: number;
    is_completed: boolean;
    completed_at: string | null;
    created_at: string;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
    user: { label: '用戶', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    content: { label: '內容', color: 'bg-green-100 text-green-600 border-green-200' },
    tech: { label: '技術', color: 'bg-purple-100 text-purple-600 border-purple-200' },
    business: { label: '商業', color: 'bg-amber-100 text-amber-600 border-amber-200' },
};

export default function MilestonesPage() {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

    // Form state
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formCategory, setFormCategory] = useState<Milestone['category']>('user');
    const [formTargetValue, setFormTargetValue] = useState('1');

    // 載入數據
    const loadMilestones = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/milestones');
            const data = await res.json();
            setMilestones(data.milestones || []);
        } catch (error) {
            console.error('Load milestones error:', error);
            toast.error('載入失敗');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMilestones();
    }, [loadMilestones]);

    const resetForm = () => {
        setFormTitle('');
        setFormDescription('');
        setFormCategory('user');
        setFormTargetValue('1');
        setEditingMilestone(null);
    };

    const openCreateDialog = () => {
        resetForm();
        setDialogOpen(true);
    };

    const openEditDialog = (milestone: Milestone) => {
        setEditingMilestone(milestone);
        setFormTitle(milestone.title);
        setFormDescription(milestone.description);
        setFormCategory(milestone.category);
        setFormTargetValue(milestone.target_value.toString());
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formTitle.trim()) {
            toast.error('請輸入標題');
            return;
        }

        try {
            if (editingMilestone) {
                await fetch('/api/admin/milestones', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingMilestone.id,
                        title: formTitle,
                        description: formDescription,
                        category: formCategory,
                        target_value: parseInt(formTargetValue) || 1,
                    }),
                });
                toast.success('里程碑已更新');
            } else {
                await fetch('/api/admin/milestones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: formTitle,
                        description: formDescription,
                        category: formCategory,
                        target_value: parseInt(formTargetValue) || 1,
                    }),
                });
                toast.success('里程碑已新增');
            }

            setDialogOpen(false);
            resetForm();
            loadMilestones();
        } catch (error) {
            console.error('Save error:', error);
            toast.error('保存失敗');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/admin/milestones?id=${id}`, { method: 'DELETE' });
            toast.success('里程碑已刪除');
            loadMilestones();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('刪除失敗');
        }
    };

    const toggleComplete = async (milestone: Milestone) => {
        try {
            await fetch('/api/admin/milestones', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: milestone.id,
                    is_completed: !milestone.is_completed,
                    current_value: !milestone.is_completed ? milestone.target_value : milestone.current_value,
                }),
            });
            loadMilestones();
        } catch (error) {
            console.error('Toggle complete error:', error);
            toast.error('操作失敗');
        }
    };

    const completedCount = milestones.filter(m => m.is_completed).length;
    const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6" />
                        里程碑管理
                    </h2>
                    <p className="text-zinc-500">追蹤平台發展進度</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadMilestones} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        刷新
                    </Button>
                    <Button size="sm" onClick={openCreateDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        新增里程碑
                    </Button>
                </div>
            </div>

            {/* Progress */}
            <Card>
                <CardContent className="py-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">總體進度</span>
                        <span className="text-sm text-zinc-500">{completedCount}/{milestones.length} 已完成</span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-zinc-900 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Milestones Grid */}
            {isLoading ? (
                <div className="text-center py-12 text-zinc-500">載入中...</div>
            ) : milestones.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12 text-zinc-500">
                        <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>暫無里程碑</p>
                        <p className="text-sm mt-2">請先執行數據庫 Migration</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 md:grid-cols-2">
                    {milestones.map((milestone) => (
                        <Card
                            key={milestone.id}
                            className={`transition-colors ${milestone.is_completed ? 'bg-zinc-50 border-zinc-200' : ''}`}
                        >
                            <CardContent className="py-4">
                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => toggleComplete(milestone)}
                                        className="mt-0.5"
                                    >
                                        {milestone.is_completed ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-zinc-300" />
                                        )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className={`font-medium ${milestone.is_completed ? 'line-through text-zinc-400' : ''}`}>
                                                {milestone.title}
                                            </p>
                                            <Badge variant="outline" className={categoryLabels[milestone.category]?.color || ''}>
                                                {categoryLabels[milestone.category]?.label || milestone.category}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-zinc-500">{milestone.description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-zinc-400 rounded-full"
                                                    style={{ width: `${Math.min(100, (milestone.current_value / milestone.target_value) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-zinc-400">
                                                {milestone.current_value}/{milestone.target_value}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button size="sm" variant="ghost" onClick={() => openEditDialog(milestone)} className="h-7 w-7 p-0">
                                            <Edit2 className="w-3 h-3" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(milestone.id)} className="h-7 w-7 p-0 text-red-500">
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingMilestone ? '編輯里程碑' : '新增里程碑'}</DialogTitle>
                        <DialogDescription>設定里程碑目標</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">標題</label>
                            <Input
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="例如：1000 位用戶"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">描述</label>
                            <Textarea
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                placeholder="里程碑描述..."
                                rows={2}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">類別</label>
                                <div className="flex gap-1 mt-1 flex-wrap">
                                    {Object.entries(categoryLabels).map(([key, { label }]) => (
                                        <button
                                            key={key}
                                            onClick={() => setFormCategory(key as Milestone['category'])}
                                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${formCategory === key
                                                ? 'bg-zinc-900 text-white border-zinc-900'
                                                : 'bg-white border-zinc-200 hover:border-zinc-400'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">目標值</label>
                                <Input
                                    type="number"
                                    value={formTargetValue}
                                    onChange={(e) => setFormTargetValue(e.target.value)}
                                    placeholder="1"
                                    className="mt-1"
                                />
                            </div>
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
