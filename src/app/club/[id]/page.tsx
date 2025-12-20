"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import ClubHeader from "@/components/club/ClubHeader";
import { DiscussionList, DiscussionInput } from "@/components/club/DiscussionList";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Calendar, Users, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Club {
    id: string;
    name: string;
    description: string | null;
    cover_image: string | null;
    club_type: 'public' | 'private' | 'vendor';
    member_count: number;
    tags: string[];
    owner_id: string;
    owner?: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
    };
    membership?: {
        id: string;
        role: string;
    } | null;
}

interface Discussion {
    id: string;
    content: string;
    display_mode: 'real' | 'nickname' | 'anonymous';
    display_name: string | null;
    is_pinned: boolean;
    like_count: number;
    reply_count: number;
    liked?: boolean;
    created_at: string;
    author?: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
    };
}

interface ClubEvent {
    id: string;
    title: string;
    cover_image: string | null;
    start_time: string;
    location_name: string | null;
    venue_name: string | null;
}

export default function ClubDetailPage() {
    const router = useRouter();
    const params = useParams();
    const clubId = params.id as string;

    const [club, setClub] = useState<Club | null>(null);
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [events, setEvents] = useState<ClubEvent[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [eventsLoading, setEventsLoading] = useState(false);

    const fetchClub = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);

        try {
            const response = await fetch(`/api/clubs/${clubId}`);
            if (!response.ok) {
                toast.error('找不到該俱樂部');
                router.push('/club');
                return;
            }
            const data = await response.json();
            setClub(data);
        } catch (error) {
            console.error('Error fetching club:', error);
            toast.error('載入失敗');
        } finally {
            setLoading(false);
        }
    }, [clubId, router]);

    const fetchDiscussions = useCallback(async () => {
        if (!club?.membership) return; // 只有成員才能看討論

        try {
            const response = await fetch(`/api/clubs/${clubId}/discussions`);
            if (response.ok) {
                const data = await response.json();
                setDiscussions(data);
            }
        } catch (error) {
            console.error('Error fetching discussions:', error);
        }
    }, [clubId, club?.membership]);

    const fetchEvents = useCallback(async () => {
        setEventsLoading(true);
        try {
            const response = await fetch(`/api/clubs/${clubId}/events`);
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setEventsLoading(false);
        }
    }, [clubId]);

    useEffect(() => {
        fetchClub();
    }, [fetchClub]);

    useEffect(() => {
        if (club?.membership) {
            fetchDiscussions();
        }
    }, [club?.membership, fetchDiscussions]);

    useEffect(() => {
        if (club) {
            fetchEvents();
        }
    }, [club, fetchEvents]);

    const handleJoin = async () => {
        try {
            const response = await fetch(`/api/clubs/${clubId}/join`, { method: 'POST' });
            if (response.ok) {
                toast.success('已成功加入俱樂部！');
                fetchClub();
            } else {
                const data = await response.json();
                toast.error(data.error || '加入失敗');
            }
        } catch (error) {
            console.error('Error joining club:', error);
            toast.error('加入失敗');
        }
    };

    const handleLeave = async () => {
        try {
            const response = await fetch(`/api/clubs/${clubId}/leave`, { method: 'POST' });
            if (response.ok) {
                toast.success('已退出俱樂部');
                fetchClub();
            } else {
                const data = await response.json();
                toast.error(data.error || '退出失敗');
            }
        } catch (error) {
            console.error('Error leaving club:', error);
            toast.error('退出失敗');
        }
    };

    const handlePostDiscussion = async (content: string, displayMode: 'real' | 'nickname' | 'anonymous') => {
        setIsPosting(true);
        try {
            const response = await fetch(`/api/clubs/${clubId}/discussions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, display_mode: displayMode }),
            });

            if (response.ok) {
                const newDiscussion = await response.json();
                setDiscussions(prev => [newDiscussion, ...prev]);
                toast.success('已發佈！');
            } else {
                const data = await response.json();
                toast.error(data.error || '發佈失敗');
            }
        } catch (error) {
            console.error('Error posting:', error);
            toast.error('發佈失敗');
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (discussionId: string) => {
        try {
            const response = await fetch(`/api/clubs/${clubId}/discussions/${discussionId}/like`, {
                method: 'POST',
            });

            if (response.ok) {
                const { liked } = await response.json();
                setDiscussions(prev => prev.map(d =>
                    d.id === discussionId
                        ? { ...d, liked, like_count: liked ? d.like_count + 1 : d.like_count - 1 }
                        : d
                ));
            }
        } catch (error) {
            console.error('Error liking:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="animate-pulse text-zinc-400">載入中...</div>
            </div>
        );
    }

    if (!club) {
        return null;
    }

    const isMember = !!club.membership;

    return (
        <main className="min-h-screen bg-zinc-50 pb-20">
            <ClubHeader
                club={club}
                currentUserId={currentUserId || undefined}
                onBack={() => router.back()}
                onJoin={handleJoin}
                onLeave={handleLeave}
            />

            <div className="bg-white min-h-[50vh]">
                <Tabs defaultValue="discussions" className="w-full">
                    <TabsList className="w-full justify-start px-4 border-b border-zinc-100 bg-transparent h-12">
                        <TabsTrigger value="discussions" className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            討論區
                        </TabsTrigger>
                        <TabsTrigger value="events" className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none">
                            <Calendar className="w-4 h-4 mr-2" />
                            活動
                        </TabsTrigger>
                        <TabsTrigger value="members" className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none">
                            <Users className="w-4 h-4 mr-2" />
                            成員
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="discussions" className="p-4 space-y-4">
                        {isMember ? (
                            <>
                                <DiscussionInput
                                    onSubmit={handlePostDiscussion}
                                    isLoading={isPosting}
                                />
                                <DiscussionList
                                    discussions={discussions}
                                    onLike={handleLike}
                                />
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <MessageSquare className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                                <p className="text-zinc-500">加入俱樂部即可查看討論</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="events" className="p-4">
                        {eventsLoading ? (
                            <div className="space-y-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-24 bg-zinc-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : events.length > 0 ? (
                            <div className="space-y-4">
                                {/* Admin can create event */}
                                {(club?.membership?.role === 'owner' || club?.membership?.role === 'admin') && (
                                    <Link href={`/host/create?clubId=${clubId}`}>
                                        <Button variant="outline" className="w-full rounded-full mb-4">
                                            <Plus className="w-4 h-4 mr-2" />
                                            創建俱樂部活動
                                        </Button>
                                    </Link>
                                )}
                                {events.map(event => (
                                    <Link key={event.id} href={`/events/${event.id}`}>
                                        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
                                            <div
                                                className="w-20 h-20 rounded-xl bg-zinc-200 bg-cover bg-center shrink-0"
                                                style={{ backgroundImage: event.cover_image ? `url(${event.cover_image})` : undefined }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold truncate">{event.title}</h3>
                                                <p className="text-sm text-zinc-500 mt-1">
                                                    {new Date(event.start_time).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', weekday: 'short' })}
                                                </p>
                                                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {event.venue_name || event.location_name || '待定'}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                                <p className="text-zinc-500">尚無活動</p>
                                <p className="text-sm text-zinc-400 mb-4">俱樂部活動將顯示在這裡</p>
                                {(club?.membership?.role === 'owner' || club?.membership?.role === 'admin') && (
                                    <Link href={`/host/create?clubId=${clubId}`}>
                                        <Button variant="outline" className="rounded-full">
                                            <Plus className="w-4 h-4 mr-2" />
                                            創建第一個活動
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="members" className="p-4">
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                            <p className="text-zinc-500">{club.member_count} 位成員</p>
                            <p className="text-sm text-zinc-400">成員列表即將推出</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
