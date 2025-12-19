'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Settings, MessageSquare, Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { toast } from 'sonner';

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

interface ClubHeaderProps {
    club: Club;
    currentUserId?: string;
    onBack?: () => void;
    onJoin?: () => void;
    onLeave?: () => void;
}

export default function ClubHeader({
    club,
    currentUserId,
    onBack,
    onJoin,
    onLeave,
}: ClubHeaderProps) {
    const [isLoading, setIsLoading] = useState(false);

    const isOwner = currentUserId === club.owner_id;
    const isMember = !!club.membership;
    const isAdmin = club.membership?.role === 'admin' || club.membership?.role === 'owner';

    const handleJoinLeave = async () => {
        setIsLoading(true);
        try {
            if (isMember) {
                await onLeave?.();
            } else {
                await onJoin?.();
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: club.name,
                text: club.description || `Join ${club.name} on Party`,
                url: window.location.href,
            });
        } catch {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(window.location.href);
            toast.success('連結已複製到剪貼簿');
        }
    };

    return (
        <div className="relative">
            {/* Cover Image */}
            <div className="h-48 md:h-64 bg-zinc-100 relative">
                {club.cover_image ? (
                    <img
                        src={club.cover_image}
                        alt={club.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Top Actions */}
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleShare}
                            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full"
                        >
                            <Share2 className="w-5 h-5" />
                        </Button>

                        {isAdmin && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full"
                                asChild
                            >
                                <a href={`/club/${club.id}/manage`}>
                                    <Settings className="w-5 h-5" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Club Info */}
            <div className="bg-white px-4 py-6 -mt-8 relative rounded-t-3xl">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold truncate">{club.name}</h1>

                        {club.description && (
                            <p className="text-zinc-500 mt-1 line-clamp-2">
                                {club.description}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-4 text-sm text-zinc-600">
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{club.member_count} 位成員</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>討論</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>活動</span>
                            </div>
                        </div>

                        {/* Owner */}
                        {club.owner && (
                            <div className="flex items-center gap-2 mt-4">
                                {club.owner.avatar_url ? (
                                    <img
                                        src={club.owner.avatar_url}
                                        alt={club.owner.full_name || 'Owner'}
                                        className="w-8 h-8 rounded-full"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-zinc-200" />
                                )}
                                <div>
                                    <p className="text-sm font-medium">
                                        {club.owner.full_name || '未知用戶'}
                                    </p>
                                    <p className="text-xs text-zinc-400">負責人</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Join/Leave Button */}
                    {!isOwner && (
                        <Button
                            onClick={handleJoinLeave}
                            disabled={isLoading}
                            className={`rounded-full px-6 ${isMember
                                ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                                : 'bg-black text-white hover:bg-zinc-800'
                                }`}
                        >
                            {isLoading ? '...' : isMember ? '退出' : '加入'}
                        </Button>
                    )}
                </div>

                {/* Tags */}
                {club.tags && club.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {club.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-sm px-3 py-1 bg-zinc-100 rounded-full text-zinc-600"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
