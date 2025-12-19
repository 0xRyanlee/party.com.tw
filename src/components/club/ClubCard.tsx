'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Crown, Zap } from 'lucide-react';

interface Club {
    id: string;
    name: string;
    description: string | null;
    cover_image: string | null;
    club_type: 'public' | 'private' | 'vendor';
    member_count: number;
    tags: string[];
    owner?: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
    };
}

interface ClubCardProps {
    club: Club;
    showOwner?: boolean;
}

const TYPE_STYLES = {
    public: { bg: 'bg-black', label: '公開' },
    private: { bg: 'bg-purple-600', label: '私密' },
    vendor: { bg: 'bg-blue-600', label: '商戶' },
};

const TYPE_ICONS = {
    public: Users,
    private: Shield,
    vendor: Zap,
};

export default function ClubCard({ club, showOwner = false }: ClubCardProps) {
    const typeStyle = TYPE_STYLES[club.club_type] || TYPE_STYLES.public;
    const TypeIcon = TYPE_ICONS[club.club_type] || Users;

    return (
        <Link href={`/club/${club.id}`}>
            <div className="bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md transition-all group">
                {/* Cover Image */}
                <div className="h-32 bg-zinc-100 relative overflow-hidden">
                    {club.cover_image ? (
                        <img
                            src={club.cover_image}
                            alt={club.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
                            <Crown className="w-12 h-12 text-zinc-300" />
                        </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-3 right-3">
                        <Badge className={`${typeStyle.bg} text-white border-none`}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {typeStyle.label}
                        </Badge>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-bold text-lg mb-1 truncate">{club.name}</h3>

                    {club.description && (
                        <p className="text-sm text-zinc-500 mb-3 line-clamp-2">
                            {club.description}
                        </p>
                    )}

                    {/* Tags */}
                    {club.tags && club.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {club.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs px-2 py-0.5 bg-zinc-100 rounded-full text-zinc-600"
                                >
                                    {tag}
                                </span>
                            ))}
                            {club.tags.length > 3 && (
                                <span className="text-xs text-zinc-400">
                                    +{club.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-zinc-400">
                            <Users className="w-4 h-4" />
                            <span>{club.member_count}</span>
                        </div>

                        {showOwner && club.owner && (
                            <div className="flex items-center gap-2">
                                {club.owner.avatar_url ? (
                                    <img
                                        src={club.owner.avatar_url}
                                        alt={club.owner.full_name || 'Owner'}
                                        className="w-5 h-5 rounded-full"
                                    />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-zinc-200" />
                                )}
                                <span className="text-xs text-zinc-500 truncate max-w-[80px]">
                                    {club.owner.full_name || '未知用戶'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
