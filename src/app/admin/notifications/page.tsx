'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Bell, Send, Clock, Users, Tag, Calendar, Plus,
    Trash2, Edit2, RefreshCw, Mail, AlertCircle
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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface Notification {
    id: string;
    title: string;
    content: string;
    target_type: 'all' | 'kol' | 'vendor' | 'plus' | 'club';
    target_label: string;
    channel: 'email' | 'site' | 'both';
    scheduled_at: string | null;
    sent_at: string | null;
    status: 'draft' | 'scheduled' | 'sent';
    created_at: string;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: '系統維護通知',
        content: '平台將於 12/25 進行例行維護，預計停機 2 小時。',
        target_type: 'all',
        target_label: '全體用戶',
        channel: 'both',
        scheduled_at: null,
        sent_at: new Date(Date.now() - 86400000).toISOString(),
        status: 'sent',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
        id: '2',
        title: 'KOL 專屬活動邀請',
        content: '誠邀您參加 Party 平台年度 KOL 答謝派對！',
        target_type: 'kol',
        target_label: 'KOL 認證用戶',
        channel: 'email',
        scheduled_at: new Date(Date.now() + 86400000 * 3).toISOString(),
        sent_at: null,
        status: 'scheduled',
        created_at: new Date().toISOString(),
    },
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [isLoading, setIsLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState<Notification | null>(null);

    // Form state
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formTargetType, setFormTargetType] = useState<'all' | 'kol' | 'vendor' | 'plus' | 'club'>('all');
    const [formChannel, setFormChannel] = useState<'email' | 'site' | 'both'>('both');
    const [formScheduled, setFormScheduled] = useState('');

    const resetForm = () => {
        setFormTitle('');
        setFormContent('');
        setFormTargetType('all');
        setFormChannel('both');
        setFormScheduled('');
        setEditingNotification(null);
    };

    const openCreateDialog = () => {
        resetForm();
        setDialogOpen(true);
    };

    const openEditDialog = (notification: Notification) => {
        setEditingNotification(notification);
        setFormTitle(notification.title);
        setFormContent(notification.content);
        setFormTargetType(notification.target_type);
        setFormChannel(notification.channel);
        setFormScheduled(notification.scheduled_at ? notification.scheduled_at.slice(0, 16) : '');
        setDialogOpen(true);
    };

    const handleSave = async (sendNow: boolean) => {
        if (!formTitle || !formContent) {
            toast.error('請填寫標題和內容');
            return;
        }

        const targetLabels: Record<string, string> = {
            all: '全體用戶',
            kol: 'KOL 認證用戶',
            vendor: 'Vendor 認證用戶',
            plus: 'Plus 會員',
            club: '俱樂部成員',
        };

        const newNotification: Notification = {
            id: editingNotification?.id || Date.now().toString(),
            title: formTitle,
            content: formContent,
            target_type: formTargetType,
            target_label: targetLabels[formTargetType],
            channel: formChannel,
            scheduled_at: sendNow ? null : formScheduled || null,
            sent_at: sendNow ? new Date().toISOString() : null,
            status: sendNow ? 'sent' : formScheduled ? 'scheduled' : 'draft',
            created_at: editingNotification?.created_at || new Date().toISOString(),
        };

        if (editingNotification) {
            setNotifications(prev => prev.map(n => n.id === editingNotification.id ? newNotification : n));
        } else {
            setNotifications(prev => [newNotification, ...prev]);
        }

        toast.success(sendNow ? '通知已發送' : formScheduled ? '通知已排程' : '草稿已保存');
        setDialogOpen(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success('通知已刪除');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">已發送</Badge>;
            case 'scheduled':
                return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">已排程</Badge>;
            case 'draft':
                return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">草稿</Badge>;
            default:
                return null;
        }
    };

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'email':
                return <Mail className="w-4 h-4" />;
            case 'site':
                return <Bell className="w-4 h-4" />;
            case 'both':
                return (
                    <div className="flex gap-1">
                        <Mail className="w-3 h-3" />
                        <Bell className="w-3 h-3" />
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="w-6 h-6" />
                        推播通知
                    </h2>
                    <p className="text-gray-500">發送 Email 和站內通知給用戶</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsLoading(true)} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        刷新
                    </Button>
                    <Button size="sm" onClick={openCreateDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        新建通知
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-green-600">{notifications.filter(n => n.status === 'sent').length}</p>
                        <p className="text-sm text-gray-500">已發送</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-blue-600">{notifications.filter(n => n.status === 'scheduled').length}</p>
                        <p className="text-sm text-gray-500">排程中</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-gray-400">{notifications.filter(n => n.status === 'draft').length}</p>
                        <p className="text-sm text-gray-500">草稿</p>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications List */}
            <Card>
                <CardHeader>
                    <CardTitle>通知列表</CardTitle>
                    <CardDescription>共 {notifications.length} 則通知</CardDescription>
                </CardHeader>
                <CardContent>
                    {notifications.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>暫無通知</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium">{notification.title}</p>
                                            {getStatusBadge(notification.status)}
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-1">{notification.content}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {notification.target_label}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                {getChannelIcon(notification.channel)}
                                            </span>
                                            {notification.scheduled_at && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(notification.scheduled_at).toLocaleDateString('zh-TW')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        {notification.status !== 'sent' && (
                                            <>
                                                <Button size="sm" variant="ghost" onClick={() => openEditDialog(notification)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(notification.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingNotification ? '編輯通知' : '新建通知'}</DialogTitle>
                        <DialogDescription>設定通知內容和發送對象</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">標題</label>
                            <Input
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="通知標題"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">內容</label>
                            <Textarea
                                value={formContent}
                                onChange={(e) => setFormContent(e.target.value)}
                                placeholder="通知內容..."
                                rows={3}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">發送對象</label>
                            <div className="flex gap-2 mt-1 flex-wrap">
                                {[
                                    { value: 'all', label: '全體用戶' },
                                    { value: 'kol', label: 'KOL' },
                                    { value: 'vendor', label: 'Vendor' },
                                    { value: 'plus', label: 'Plus 會員' },
                                    { value: 'club', label: '俱樂部' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFormTargetType(opt.value as any)}
                                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${formTargetType === opt.value
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">發送方式</label>
                            <div className="flex gap-2 mt-1">
                                {[
                                    { value: 'email', label: 'Email', icon: Mail },
                                    { value: 'site', label: '站內', icon: Bell },
                                    { value: 'both', label: '兩者', icon: Send },
                                ].map(opt => {
                                    const Icon = opt.icon;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => setFormChannel(opt.value as any)}
                                            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors ${formChannel === opt.value
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            <Icon className="w-3 h-3" />
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">預約發送（選填）</label>
                            <Input
                                type="datetime-local"
                                value={formScheduled}
                                onChange={(e) => setFormScheduled(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button variant="outline" onClick={() => handleSave(false)}>
                            保存草稿
                        </Button>
                        <Button onClick={() => handleSave(true)}>
                            <Send className="w-4 h-4 mr-2" />
                            立即發送
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
