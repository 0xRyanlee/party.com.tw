'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import {
    Bell, Send, Clock, Users, Plus, Trash2, Edit2, RefreshCw,
    Mail, Search, X, Check, User, Building2, Eye, Save
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserResult {
    id: string;
    display_name: string;
    email: string;
    avatar_url: string | null;
    role: string;
    tier: string;
    tier_expires_at: string | null;
}

interface ClubResult {
    id: string;
    name: string;
    description: string;
    is_private: boolean;
    member_count: number;
}

interface Notification {
    id: string;
    title: string;
    content: string;
    target_type: 'all' | 'tier' | 'users' | 'clubs';
    target_filter: {
        tier?: string;
        user_ids?: string[];
        club_ids?: string[];
    };
    channel: 'email' | 'site' | 'both';
    scheduled_at: string | null;
    sent_at: string | null;
    status: 'draft' | 'scheduled' | 'sent';
    created_at: string;
}

// Email 模板
const emailTemplates = [
    {
        id: 'welcome',
        name: '歡迎加入',
        subject: '歡迎加入 Party 平台！',
        body: `親愛的 {{user_name}}，

歡迎加入 Party 平台！我們很高興您成為我們的一員。

在這裡，您可以：
- 探索各式各樣的活動
- 發起屬於自己的活動
- 認識志同道合的朋友

如有任何問題，歡迎隨時聯繫我們。

Party 團隊`,
    },
    {
        id: 'tier_expiring',
        name: '會員到期提醒',
        subject: '您的 {{tier}} 會員即將到期',
        body: `親愛的 {{user_name}}，

您的 {{tier}} 會員將於 {{expire_date}} 到期。

為感謝您這段時間的支持，我們特別為您準備了專屬優惠：

使用優惠碼：{{coupon_code}}
可享 6 折續訂 Pro 會員！

點擊此連結立即續訂：{{link}}

感謝您的支持！
Party 團隊`,
    },
    {
        id: 'promotion',
        name: '優惠通知',
        subject: '專屬優惠等你來領取！',
        body: `親愛的 {{user_name}}，

我們為您準備了一份特別優惠！

{{content}}

點擊此連結領取：{{link}}

此優惠可能隨時結束，請把握機會！

Party 團隊`,
    },
    {
        id: 'custom',
        name: '自訂模板',
        subject: '',
        body: '',
    },
];

const tierOptions = [
    { value: 'all', label: '全體用戶' },
    { value: 'free', label: '免費用戶' },
    { value: 'plus', label: 'Plus 會員' },
    { value: 'pro', label: 'Pro 會員' },
    { value: 'kol', label: 'KOL 認證' },
    { value: 'vendor', label: 'Vendor 認證' },
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const supabase = createClient();

    // 發送對象狀態
    const [targetType, setTargetType] = useState<'all' | 'tier' | 'users' | 'clubs'>('all');
    const [selectedTier, setSelectedTier] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState<UserResult[]>([]);
    const [selectedClubs, setSelectedClubs] = useState<ClubResult[]>([]);

    // 搜索狀態
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userSearchResults, setUserSearchResults] = useState<UserResult[]>([]);
    const [clubSearchQuery, setClubSearchQuery] = useState('');
    const [clubSearchResults, setClubSearchResults] = useState<ClubResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // 模板狀態
    const [selectedTemplate, setSelectedTemplate] = useState('custom');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [notificationTitle, setNotificationTitle] = useState('');

    // 發送設置
    const [channel, setChannel] = useState<'email' | 'site' | 'both'>('both');
    const [scheduledAt, setScheduledAt] = useState('');

    // 變量
    const [customLink, setCustomLink] = useState('');
    const [customCoupon, setCustomCoupon] = useState('');

    // 搜索用戶
    const searchUsers = useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setUserSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}&limit=10`);
            const data = await res.json();
            setUserSearchResults(data.users || []);
        } catch (error) {
            console.error('User search error:', error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // 搜索俱樂部
    const searchClubs = useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setClubSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`/api/admin/clubs/search?q=${encodeURIComponent(query)}&limit=10`);
            const data = await res.json();
            setClubSearchResults(data.clubs || []);
        } catch (error) {
            console.error('Club search error:', error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // 搜索防抖
    useEffect(() => {
        const timer = setTimeout(() => {
            searchUsers(userSearchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [userSearchQuery, searchUsers]);

    useEffect(() => {
        const timer = setTimeout(() => {
            searchClubs(clubSearchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [clubSearchQuery, searchClubs]);

    // 選擇模板
    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        const template = emailTemplates.find(t => t.id === templateId);
        if (template && templateId !== 'custom') {
            setEmailSubject(template.subject);
            setEmailBody(template.body);
            setNotificationTitle(template.name);
        }
    };

    // 添加用戶
    const addUser = (user: UserResult) => {
        if (!selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers(prev => [...prev, user]);
        }
        setUserSearchQuery('');
        setUserSearchResults([]);
    };

    // 移除用戶
    const removeUser = (userId: string) => {
        setSelectedUsers(prev => prev.filter(u => u.id !== userId));
    };

    // 添加俱樂部
    const addClub = (club: ClubResult) => {
        if (!selectedClubs.find(c => c.id === club.id)) {
            setSelectedClubs(prev => [...prev, club]);
        }
        setClubSearchQuery('');
        setClubSearchResults([]);
    };

    // 移除俱樂部
    const removeClub = (clubId: string) => {
        setSelectedClubs(prev => prev.filter(c => c.id !== clubId));
    };

    // 預覽替換變量
    const getPreviewContent = (content: string) => {
        return content
            .replace(/\{\{user_name\}\}/g, '王小明')
            .replace(/\{\{email\}\}/g, 'example@email.com')
            .replace(/\{\{tier\}\}/g, 'Plus')
            .replace(/\{\{expire_date\}\}/g, '2024/01/31')
            .replace(/\{\{coupon_code\}\}/g, customCoupon || 'PARTY2024')
            .replace(/\{\{link\}\}/g, customLink || 'https://party.example.com/redeem')
            .replace(/\{\{content\}\}/g, '限時優惠活動');
    };

    // 發送通知
    const handleSend = async (sendNow: boolean) => {
        if (!notificationTitle || !emailBody) {
            toast.error('請填寫標題和內容');
            return;
        }

        if (targetType === 'users' && selectedUsers.length === 0) {
            toast.error('請選擇至少一位用戶');
            return;
        }

        if (targetType === 'clubs' && selectedClubs.length === 0) {
            toast.error('請選擇至少一個俱樂部');
            return;
        }

        const notification: Notification = {
            id: Date.now().toString(),
            title: notificationTitle,
            content: emailBody,
            target_type: targetType,
            target_filter: {
                tier: targetType === 'tier' ? selectedTier : undefined,
                user_ids: targetType === 'users' ? selectedUsers.map(u => u.id) : undefined,
                club_ids: targetType === 'clubs' ? selectedClubs.map(c => c.id) : undefined,
            },
            channel,
            scheduled_at: sendNow ? null : scheduledAt || null,
            sent_at: sendNow ? new Date().toISOString() : null,
            status: sendNow ? 'sent' : scheduledAt ? 'scheduled' : 'draft',
            created_at: new Date().toISOString(),
        };

        setNotifications(prev => [notification, ...prev]);

        if (sendNow) {
            toast.success(`通知已發送給 ${getRecipientCount()} 位收件人`);
        } else if (scheduledAt) {
            toast.success('通知已排程');
        } else {
            toast.success('草稿已保存');
        }

        setDialogOpen(false);
        resetForm();
    };

    // 獲取收件人數量
    const getRecipientCount = () => {
        if (targetType === 'users') return selectedUsers.length;
        if (targetType === 'clubs') return selectedClubs.length;
        if (targetType === 'tier' && selectedTier !== 'all') return '篩選';
        return '全體';
    };

    // 重置表單
    const resetForm = () => {
        setTargetType('all');
        setSelectedTier('all');
        setSelectedUsers([]);
        setSelectedClubs([]);
        setSelectedTemplate('custom');
        setEmailSubject('');
        setEmailBody('');
        setNotificationTitle('');
        setChannel('both');
        setScheduledAt('');
        setCustomLink('');
        setCustomCoupon('');
    };

    // 獲取目標描述
    const getTargetDescription = (notification: Notification) => {
        if (notification.target_type === 'all') return '全體用戶';
        if (notification.target_type === 'tier') {
            const tier = tierOptions.find(t => t.value === notification.target_filter.tier);
            return tier?.label || notification.target_filter.tier;
        }
        if (notification.target_type === 'users') {
            return `${notification.target_filter.user_ids?.length || 0} 位用戶`;
        }
        if (notification.target_type === 'clubs') {
            return `${notification.target_filter.club_ids?.length || 0} 個俱樂部`;
        }
        return '未知';
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
                    <p className="text-zinc-500">發送 Email 和站內通知給用戶</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsLoading(true)} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        刷新
                    </Button>
                    <Button size="sm" onClick={() => setDialogOpen(true)}>
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
                        <p className="text-sm text-zinc-500">已發送</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-blue-600">{notifications.filter(n => n.status === 'scheduled').length}</p>
                        <p className="text-sm text-zinc-500">排程中</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-zinc-400">{notifications.filter(n => n.status === 'draft').length}</p>
                        <p className="text-sm text-zinc-500">草稿</p>
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
                        <div className="text-center py-12 text-zinc-500">
                            <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>暫無通知</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium">{notification.title}</p>
                                            <Badge variant="outline" className={
                                                notification.status === 'sent' ? 'bg-green-50 text-green-600' :
                                                    notification.status === 'scheduled' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-zinc-100 text-zinc-500'
                                            }>
                                                {notification.status === 'sent' ? '已發送' :
                                                    notification.status === 'scheduled' ? '已排程' : '草稿'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-zinc-500 line-clamp-1">{notification.content}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {getTargetDescription(notification)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                {notification.channel === 'email' && <Mail className="w-3 h-3" />}
                                                {notification.channel === 'site' && <Bell className="w-3 h-3" />}
                                                {notification.channel === 'both' && <>
                                                    <Mail className="w-3 h-3" />
                                                    <Bell className="w-3 h-3" />
                                                </>}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        {notification.status !== 'sent' && (
                                            <Button size="sm" variant="ghost" className="text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>新建通知</DialogTitle>
                        <DialogDescription>設定通知內容、發送對象和排程</DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="target" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="target">發送對象</TabsTrigger>
                            <TabsTrigger value="content">內容編輯</TabsTrigger>
                            <TabsTrigger value="settings">發送設置</TabsTrigger>
                        </TabsList>

                        {/* 發送對象 */}
                        <TabsContent value="target" className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium">對象類型</label>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {[
                                        { value: 'all', label: '全體用戶', icon: Users },
                                        { value: 'tier', label: '按會員等級', icon: Users },
                                        { value: 'users', label: '指定用戶', icon: User },
                                        { value: 'clubs', label: '俱樂部成員', icon: Building2 },
                                    ].map(opt => {
                                        const Icon = opt.icon;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => setTargetType(opt.value as any)}
                                                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${targetType === opt.value
                                                    ? 'bg-zinc-900 text-white border-zinc-900'
                                                    : 'bg-white border-zinc-200 hover:border-zinc-400'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 會員等級篩選 */}
                            {targetType === 'tier' && (
                                <div>
                                    <label className="text-sm font-medium">選擇會員等級</label>
                                    <Select value={selectedTier} onValueChange={setSelectedTier}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tierOptions.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* 用戶搜索 */}
                            {targetType === 'users' && (
                                <div>
                                    <label className="text-sm font-medium">搜索用戶（名稱或郵箱）</label>
                                    <div className="relative mt-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <Input
                                            value={userSearchQuery}
                                            onChange={(e) => setUserSearchQuery(e.target.value)}
                                            placeholder="輸入用戶名或郵箱搜索..."
                                            className="pl-10"
                                        />
                                        {isSearching && (
                                            <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />
                                        )}
                                    </div>

                                    {/* 搜索結果 */}
                                    {userSearchResults.length > 0 && (
                                        <div className="mt-2 border rounded-lg divide-y max-h-40 overflow-y-auto">
                                            {userSearchResults.map(user => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => addUser(user)}
                                                    className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 text-left"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs">
                                                        {user.display_name?.[0] || 'U'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{user.display_name || '未命名'}</p>
                                                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">{user.tier}</Badge>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* 已選用戶 */}
                                    {selectedUsers.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-zinc-500 mb-2">已選擇 {selectedUsers.length} 位用戶</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedUsers.map(user => (
                                                    <Badge key={user.id} variant="secondary" className="gap-1">
                                                        {user.display_name || user.email}
                                                        <button onClick={() => removeUser(user.id)}>
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 俱樂部搜索 */}
                            {targetType === 'clubs' && (
                                <div>
                                    <label className="text-sm font-medium">搜索俱樂部</label>
                                    <div className="relative mt-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <Input
                                            value={clubSearchQuery}
                                            onChange={(e) => setClubSearchQuery(e.target.value)}
                                            placeholder="輸入俱樂部名稱搜索..."
                                            className="pl-10"
                                        />
                                    </div>

                                    {clubSearchResults.length > 0 && (
                                        <div className="mt-2 border rounded-lg divide-y max-h-40 overflow-y-auto">
                                            {clubSearchResults.map(club => (
                                                <button
                                                    key={club.id}
                                                    onClick={() => addClub(club)}
                                                    className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 text-left"
                                                >
                                                    <Building2 className="w-5 h-5 text-zinc-400" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{club.name}</p>
                                                        <p className="text-xs text-zinc-500">{club.member_count || 0} 位成員</p>
                                                    </div>
                                                    {club.is_private && <Badge variant="outline">私密</Badge>}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {selectedClubs.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-zinc-500 mb-2">已選擇 {selectedClubs.length} 個俱樂部</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedClubs.map(club => (
                                                    <Badge key={club.id} variant="secondary" className="gap-1">
                                                        {club.name}
                                                        <button onClick={() => removeClub(club.id)}>
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* 內容編輯 */}
                        <TabsContent value="content" className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium">選擇模板</label>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {emailTemplates.map(template => (
                                        <button
                                            key={template.id}
                                            onClick={() => handleTemplateSelect(template.id)}
                                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${selectedTemplate === template.id
                                                ? 'bg-zinc-900 text-white border-zinc-900'
                                                : 'bg-white border-zinc-200 hover:border-zinc-400'
                                                }`}
                                        >
                                            {template.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">通知標題</label>
                                <Input
                                    value={notificationTitle}
                                    onChange={(e) => setNotificationTitle(e.target.value)}
                                    placeholder="通知標題"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Email 主旨</label>
                                <Input
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="Email 主旨"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">內容</label>
                                    <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(true)}>
                                        <Eye className="w-3 h-3 mr-1" />
                                        預覽
                                    </Button>
                                </div>
                                <Textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    placeholder="通知內容..."
                                    rows={8}
                                    className="mt-1 font-mono text-sm"
                                />
                                <p className="text-xs text-zinc-400 mt-1">
                                    可用變量：{'{{user_name}}'} {'{{email}}'} {'{{tier}}'} {'{{expire_date}}'} {'{{coupon_code}}'} {'{{link}}'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">優惠碼（選填）</label>
                                    <Input
                                        value={customCoupon}
                                        onChange={(e) => setCustomCoupon(e.target.value)}
                                        placeholder="PARTY2024"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">連結（選填）</label>
                                    <Input
                                        value={customLink}
                                        onChange={(e) => setCustomLink(e.target.value)}
                                        placeholder="https://..."
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* 發送設置 */}
                        <TabsContent value="settings" className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium">發送方式</label>
                                <div className="flex gap-2 mt-2">
                                    {[
                                        { value: 'email', label: 'Email', icon: Mail },
                                        { value: 'site', label: '站內通知', icon: Bell },
                                        { value: 'both', label: '兩者', icon: Send },
                                    ].map(opt => {
                                        const Icon = opt.icon;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => setChannel(opt.value as any)}
                                                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${channel === opt.value
                                                    ? 'bg-zinc-900 text-white border-zinc-900'
                                                    : 'bg-white border-zinc-200 hover:border-zinc-400'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
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
                                    value={scheduledAt}
                                    onChange={(e) => setScheduledAt(e.target.value)}
                                    className="mt-1"
                                />
                                <p className="text-xs text-zinc-400 mt-1">留空則立即發送或保存為草稿</p>
                            </div>

                            {/* 發送摘要 */}
                            <Card className="bg-zinc-50">
                                <CardContent className="py-4">
                                    <p className="font-medium mb-2">發送摘要</p>
                                    <div className="text-sm space-y-1">
                                        <p>發送對象：{
                                            targetType === 'all' ? '全體用戶' :
                                                targetType === 'tier' ? tierOptions.find(t => t.value === selectedTier)?.label :
                                                    targetType === 'users' ? `${selectedUsers.length} 位用戶` :
                                                        `${selectedClubs.length} 個俱樂部`
                                        }</p>
                                        <p>發送方式：{channel === 'email' ? 'Email' : channel === 'site' ? '站內通知' : 'Email + 站內'}</p>
                                        <p>發送時間：{scheduledAt ? new Date(scheduledAt).toLocaleString('zh-TW') : '立即發送'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button variant="outline" onClick={() => handleSend(false)}>
                            <Save className="w-4 h-4 mr-2" />
                            保存草稿
                        </Button>
                        <Button onClick={() => handleSend(true)}>
                            <Send className="w-4 h-4 mr-2" />
                            {scheduledAt ? '確認排程' : '立即發送'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>預覽</DialogTitle>
                        <DialogDescription>變量已替換為範例值</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-zinc-500">主旨</p>
                            <p className="font-medium">{getPreviewContent(emailSubject)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">內容</p>
                            <div className="p-4 bg-zinc-50 rounded-lg whitespace-pre-wrap text-sm">
                                {getPreviewContent(emailBody)}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setPreviewOpen(false)}>關閉</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
