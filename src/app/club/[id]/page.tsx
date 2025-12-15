"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import ClubHeader from "@/components/club/ClubHeader";
import { DiscussionList, DiscussionInput } from "@/components/club/DiscussionList";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Calendar, Users } from "lucide-react";

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

export default function ClubDetailPage() {
    const router = useRouter();
    const params = useParams();
    const clubId = params.id as string;

    const [club, setClub] = useState<Club | null>(null);
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    const fetchClub = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);

        try {
            const response = await fetch(`/api/clubs/${clubId}`);
            if (!response.ok) {
                toast.error('Club not found');
                router.push('/club');
                return;
            }
            const data = await response.json();
            setClub(data);
        } catch (error) {
            console.error('Error fetching club:', error);
            toast.error('Failed to load club');
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

    useEffect(() => {
        fetchClub();
    }, [fetchClub]);

    useEffect(() => {
        if (club?.membership) {
            fetchDiscussions();
        }
    }, [club?.membership, fetchDiscussions]);

    const handleJoin = async () => {
        try {
            const response = await fetch(`/api/clubs/${clubId}/join`, { method: 'POST' });
            if (response.ok) {
                toast.success('Joined club successfully!');
                fetchClub();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to join');
            }
        } catch (error) {
            console.error('Error joining club:', error);
            toast.error('Failed to join club');
        }
    };

    const handleLeave = async () => {
        try {
            const response = await fetch(`/api/clubs/${clubId}/leave`, { method: 'POST' });
            if (response.ok) {
                toast.success('Left club');
                fetchClub();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to leave');
            }
        } catch (error) {
            console.error('Error leaving club:', error);
            toast.error('Failed to leave club');
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
                toast.success('Posted!');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to post');
            }
        } catch (error) {
            console.error('Error posting:', error);
            toast.error('Failed to post');
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
                <div className="animate-pulse text-zinc-400">Loading...</div>
            </div>
        );
    }

    if (!club) {
        return null;
    }

    const isMember = !!club.membership;

    return (
        <main className="min-h-screen bg-zinc-50">
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
                            Discussions
                        </TabsTrigger>
                        <TabsTrigger value="events" className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none">
                            <Calendar className="w-4 h-4 mr-2" />
                            Events
                        </TabsTrigger>
                        <TabsTrigger value="members" className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none">
                            <Users className="w-4 h-4 mr-2" />
                            Members
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
                                <p className="text-zinc-500">Join the club to see discussions</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="events" className="p-4">
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                            <p className="text-zinc-500">No events yet</p>
                            <p className="text-sm text-zinc-400">Club events will appear here</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="members" className="p-4">
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                            <p className="text-zinc-500">{club.member_count} members</p>
                            <p className="text-sm text-zinc-400">Member list coming soon</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
