'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import {
    Target, Plus, Trash2, Edit2, Save, X,
    RefreshCw, CheckCircle, Circle, AlertCircle
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

// 預設 10 個里程碑
const defaultMilestones: Milestone[] = [
    { id: '1', title: '首位用戶註冊', description: '平台迎來第一位註冊用戶', category: 'user', target_value: 1, current_value: 0, is_completed: false, completed_at: null, created_at: new Date().toISOString() },
    { id: '2', title: '100 位用戶', description: '累計 100 位註冊用戶', category: 'user', target_value: 100, current_value: 0, is_completed: false, completed_at: null, created_at: new Date().toISOString() },
    { id: '3', title: '1000 位用戶', description: '突破千人大關', category: 'user', target_value: 1000, current_value: 0, is_completed: false, completed_at: null, created_at: new Date().toISOString() },
    { id: '4', title: '首場活動發布', description: '平台發布第一場活動', category: 'content', target_value: 1, current_value: 0, is_completed: false, completed_at: null, created_at: new Date().toISOString() },
    { id: '5', title: '50 場活動', description: '累計 50 場活動', category: 'content', target_value: 50, current_value: 0, is_completed: false, completed_at: null, created_at: new Date().toISOString() },
    { id: '6', title: '首筆報名', description: '第一筆活動報名', category: 'business', target_value: 1, current_value: 0, is_completed: false, completed_at: null, created_at: new Date().toISOString() },
    { id: '7', title: '100 筆報名', description: '累計 100 筆報名', category: 'business', target_value: 100, current_value: 0, is_completed: false, completed_at: null, created_at: new Date().toISOString() },
    { id: '8', title: '首位 KOL 認證', description: '第一位 KOL 通過認證', category: 'user', target_value: 1, current_value: 0, is_completed: false, completed_at: null, created_at: new Date().toISOString() },
    { id: '9', title: '正式上線', description: '平台正式對外營運', category: 'tech', target_value: 1, current_value: 0, is_completed: false, completed_at: null, created_at: new Date().toISOString() },
    { id: '10', title: 'API 穩定運行 30 天', description: 'API 連續穩定運行 30 天無重大故障', category: 'tech', target_value: 30, current_value: 0, is_completed: false, completed_at: null, created_at: new Date().toISOString() },
];

export default function MilestonesPage() {
    const [milestones, setMilestones] = useState<Milestone[]>(defaultMilestones);
    const [isLoading, setIsLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
    const supabase = createClient();

    // Form state
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formCategory, setFormCategory] = useState<Milestone['category']>('user');
    const [formTargetValue, setFormTargetValue] = useState('1');

    // 驗證里程碑（自動檢測完成狀態）
    const validateMilestones = async () => {
        setIsLoading(true);

        const [
            { count: usersCount },
            { count: eventsCount },
            { count: registrationsCount },
            { count: kolCount },
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('events').select('*', { count: 'exact', head: true }),
            supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'kol'),
        ]);

        const newMilestones = milestones.map(m => {
            let currentValue = m.current_value;

            // 根據類別自動更新當前值
            if (m.title.includes('用戶')) {
                currentValue = usersCount || 0;
            } else if (m.title.includes('活動')) {
                currentValue = eventsCount || 0;
            } else if (m.title.includes('報名')) {
                currentValue = registrationsCount || 0;
            } else if (m.title.includes('KOL')) {
                currentValue = kolCount || 0;
            }

            const isCompleted = currentValue >= m.target_value;
            return {
                ...m,
                current_value: currentValue,
                is_completed: isCompleted,
                completed_at: isCompleted && !m.is_completed ? new Date().toISOString() : m.completed_at,
            };
        });

        setMilestones(newMilestones);
        setIsLoading(false);
        toast.success('里程碑狀態已更新');
    };

    useEffect(() => {
        validateMilestones();
    }, []);

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

    const handleSave = () => {
        if (!formTitle.trim()) {
            toast.error('請輸入標題');
            return;
        }

        if (editingMilestone) {
            setMilestones(prev => prev.map(m =>
                m.id === editingMilestone.id
                    ? { ...m, title: formTitle, description: formDescription, category: formCategory, target_value: parseInt(formTargetValue) || 1 }
                    : m
            ));
            toast.success('里程碑已更新');
        } else {
            const newMilestone: Milestone = {
                id: Date.now().toString(),
                title: formTitle.trim(),
                description: formDescription.trim(),
                category: formCategory,
                target_value: parseInt(formTargetValue) || 1,
                current_value: 0,
                is_completed: false,
                completed_at: null,
                created_at: new Date().toISOString(),
            };
            setMilestones(prev => [...prev, newMilestone]);
            toast.success('里程碑已新增');
        }

        setDialogOpen(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        setMilestones(prev => prev.filter(m => m.id !== id));
        toast.success('里程碑已刪除');
    };

    const toggleComplete = (id: string) => {
        setMilestones(prev => prev.map(m =>
            m.id === id
                ? { ...m, is_completed: !m.is_completed, completed_at: !m.is_completed ? new Date().toISOString() : null }
                : m
        ));
    };

    const completedCount = milestones.filter(m => m.is_completed).length;
    const progress = Math.round((completedCount / milestones.length) * 100);

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
                    <Button variant="outline" size="sm" onClick={validateMilestones} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        驗證狀態
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
            <div className="grid gap-3 md:grid-cols-2">
                {milestones.map((milestone) => (
                    <Card
                        key={milestone.id}
                        className={`transition-colors ${milestone.is_completed ? 'bg-zinc-50 border-zinc-200' : ''}`}
                    >
                        <CardContent className="py-4">
                            <div className="flex items-start gap-3">
                                <button
                                    onClick={() => toggleComplete(milestone.id)}
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
                                        <Badge variant="outline" className={categoryLabels[milestone.category].color}>
                                            {categoryLabels[milestone.category].label}
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
