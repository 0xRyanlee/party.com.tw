'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import {
    Bell, Inbox, Check, Trash2, RefreshCw,
    AlertCircle, Calendar, Megaphone, Gift, Info
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
    id: string;
    type: 'system' | 'event' | 'promotion' | 'alert';
    title: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

const typeConfig: Record<string, { label: string; icon: typeof Bell; color: string }> = {
    system: { label: '系統通知', icon: Megaphone, color: 'bg-blue-100 text-blue-600' },
    event: { label: '活動提醒', icon: Calendar, color: 'bg-green-100 text-green-600' },
    promotion: { label: '優惠訊息', icon: Gift, color: 'bg-purple-100 text-purple-600' },
    alert: { label: '重要提醒', icon: AlertCircle, color: 'bg-red-100 text-red-600' },
};

// 模擬訊息數據
const mockMessages: Message[] = [
    {
        id: '1',
        type: 'system',
        title: '歡迎加入 Party 平台！',
        content: '感謝您註冊 Party 平台。在這裡您可以發現各種有趣的活動，也可以發起自己的活動與大家分享。',
        is_read: true,
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
        id: '2',
        type: 'event',
        title: '您報名的活動即將開始',
        content: '「週末露營派對」將於明天下午 2:00 開始，請記得準時參加！',
        is_read: false,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
        id: '3',
        type: 'promotion',
        title: '限時優惠：首次發起活動免手續費',
        content: '現在發起您的第一個活動，可享平台手續費全免優惠！有效期至本月底。',
        is_read: false,
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '4',
        type: 'alert',
        title: '帳戶安全提醒',
        content: '我們偵測到您的帳戶在新設備上登入，如非本人操作請立即修改密碼。',
        is_read: true,
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
];

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>(mockMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = messages.filter(m => !m.is_read).length;

    const filteredMessages = filter === 'unread'
        ? messages.filter(m => !m.is_read)
        : messages;

    const markAsRead = (id: string) => {
        setMessages(prev => prev.map(m =>
            m.id === id ? { ...m, is_read: true } : m
        ));
    };

    const markAllAsRead = () => {
        setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
        toast.success('已全部標記為已讀');
    };

    const deleteMessage = (id: string) => {
        setMessages(prev => prev.filter(m => m.id !== id));
        toast.success('訊息已刪除');
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)} 分鐘前`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)} 小時前`;
        } else if (diff < 86400000 * 7) {
            return `${Math.floor(diff / 86400000)} 天前`;
        } else {
            return date.toLocaleDateString('zh-TW');
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Inbox className="w-6 h-6" />
                        訊息中心
                    </h1>
                    <p className="text-gray-500">您有 {unreadCount} 則未讀訊息</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsLoading(true)} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        刷新
                    </Button>
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllAsRead}>
                            <Check className="w-4 h-4 mr-2" />
                            全部已讀
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm rounded-full transition-colors ${filter === 'all'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    全部
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 text-sm rounded-full transition-colors flex items-center gap-1 ${filter === 'unread'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    未讀
                    {unreadCount > 0 && (
                        <span className={`px-1.5 py-0.5 text-xs rounded-full ${filter === 'unread' ? 'bg-white text-black' : 'bg-red-500 text-white'
                            }`}>
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Messages List */}
            {filteredMessages.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">沒有訊息</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredMessages.map((message) => {
                        const config = typeConfig[message.type];
                        const Icon = config.icon;

                        return (
                            <Card
                                key={message.id}
                                className={`transition-colors ${!message.is_read ? 'border-l-4 border-l-blue-500' : ''}`}
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-medium ${!message.is_read ? 'text-black' : 'text-gray-600'}`}>
                                                    {message.title}
                                                </h3>
                                                {!message.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2">{message.content}</p>
                                            <p className="text-xs text-gray-400 mt-2">{formatTime(message.created_at)}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {!message.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => markAsRead(message.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteMessage(message.id)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
