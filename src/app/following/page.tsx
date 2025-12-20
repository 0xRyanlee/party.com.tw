'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, MessageCircle, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface Following {
    following_id: string;
    following: {
        id: string;
        full_name: string;
        avatar_url: string;
    };
}

export default function FollowingPage() {
    const [follows, setFollows] = useState<Following[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFollows = async () => {
        try {
            const response = await fetch('/api/follows');
            if (response.ok) {
                const data = await response.json();
                setFollows(data.follows || []);
            }
        } catch (error) {
            console.error('Fetch follows error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async (followingId: string) => {
        try {
            const response = await fetch('/api/follows', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ followingId }),
            });
            if (response.ok) {
                setFollows(prev => prev.filter(f => f.following_id !== followingId));
            }
        } catch (error) {
            console.error('Unfollow error:', error);
        }
    };

    useEffect(() => {
        fetchFollows();
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-24">
            <div className="bg-white border-b border-neutral-100 sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/settings">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-lg font-bold">關注管理</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-neutral-100" />
                        ))}
                    </div>
                ) : follows.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100 shadow-sm px-6">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-neutral-300" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">尚未關注主辦方</h2>
                        <p className="text-neutral-500 mb-6">關注您感興趣的主辦方，及時獲取最新活動通知。</p>
                        <Link href="/events">
                            <Button className="rounded-full px-8 bg-neutral-900 text-white hover:bg-neutral-800">
                                探索活動
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {follows.map((item) => (
                            <div
                                key={item.following_id}
                                className="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full bg-neutral-200 bg-cover bg-center border border-neutral-50 shrink-0"
                                        style={{ backgroundImage: item.following.avatar_url ? `url(${item.following.avatar_url})` : undefined }}
                                    >
                                        {!item.following.avatar_url && <User className="w-full h-full p-3 text-neutral-400" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-neutral-900">{item.following.full_name || '未命名主辦方'}</h3>
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5 px-1.5 border-neutral-200 text-neutral-400">Host</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <button
                                                onClick={() => window.location.href = `mailto:contact@party.com?subject=Inquiry to ${item.following.full_name}`}
                                                className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1 transition-colors"
                                            >
                                                <MessageCircle className="w-3 h-3" />
                                                聯絡
                                            </button>
                                            <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                                            <Link href={`/events?organizer=${item.following_id}`} className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                                                查看活動
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUnfollow(item.following_id)}
                                        className="rounded-full border-neutral-200 text-xs font-bold hover:bg-neutral-50 h-8"
                                    >
                                        取消關注
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 p-6 bg-neutral-900 rounded-3xl text-white">
                    <h4 className="font-bold mb-2">Following Tips</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                        After following a host, you'll be notified of their events in your Following list, whether auto-synced from external sources or directly published by the host.
                    </p>
                </div>
            </div>
        </div>
    );
}
