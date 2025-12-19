'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Heart,
    MessageCircle,
    Pin,
    MoreHorizontal,
    User,
    UserX,
    Send,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

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

interface DiscussionItemProps {
    discussion: Discussion;
    onLike?: (id: string) => void;
    onReply?: (id: string) => void;
    isReply?: boolean;
}

function DiscussionItem({ discussion, onLike, onReply, isReply = false }: DiscussionItemProps) {
    const getDisplayInfo = () => {
        if (discussion.display_mode === 'anonymous') {
            return { name: '匿名用戶', avatar: null, isAnonymous: true };
        }
        if (discussion.display_mode === 'nickname' && discussion.display_name) {
            return {
                name: discussion.display_name,
                avatar: discussion.author?.avatar_url,
                isAnonymous: false,
            };
        }
        return {
            name: discussion.author?.full_name || '未知用戶',
            avatar: discussion.author?.avatar_url,
            isAnonymous: false,
        };
    };

    const displayInfo = getDisplayInfo();

    return (
        <div className={`${isReply ? 'pl-12 border-l-2 border-zinc-100' : ''}`}>
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                    {displayInfo.isAnonymous ? (
                        <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center">
                            <UserX className="w-5 h-5 text-zinc-400" />
                        </div>
                    ) : displayInfo.avatar ? (
                        <img
                            src={displayInfo.avatar}
                            alt={displayInfo.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-zinc-400" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{displayInfo.name}</span>
                        {discussion.is_pinned && (
                            <Pin className="w-3 h-3 text-orange-500" />
                        )}
                        <span className="text-xs text-zinc-400">
                            {formatDistanceToNow(new Date(discussion.created_at), {
                                addSuffix: true,
                                locale: zhTW,
                            })}
                        </span>
                    </div>

                    <p className="text-sm text-zinc-700 mt-1 whitespace-pre-wrap">
                        {discussion.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={() => onLike?.(discussion.id)}
                            className={`flex items-center gap-1 text-xs ${discussion.liked ? 'text-red-500' : 'text-zinc-400'
                                } hover:text-red-500 transition-colors`}
                        >
                            <Heart className={`w-4 h-4 ${discussion.liked ? 'fill-current' : ''}`} />
                            <span>{discussion.like_count}</span>
                        </button>

                        {!isReply && (
                            <button
                                onClick={() => onReply?.(discussion.id)}
                                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>{discussion.reply_count}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface DiscussionListProps {
    discussions: Discussion[];
    onLike?: (id: string) => void;
    onReply?: (id: string) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoading?: boolean;
}

export function DiscussionList({
    discussions,
    onLike,
    onReply,
    onLoadMore,
    hasMore,
    isLoading,
}: DiscussionListProps) {
    if (discussions.length === 0 && !isLoading) {
        return (
            <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500">尚無討論內容</p>
                <p className="text-sm text-zinc-400">成為第一個發起對話的人吧</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {discussions.map((discussion) => (
                <DiscussionItem
                    key={discussion.id}
                    discussion={discussion}
                    onLike={onLike}
                    onReply={onReply}
                />
            ))}

            {hasMore && (
                <div className="text-center">
                    <Button
                        variant="outline"
                        onClick={onLoadMore}
                        disabled={isLoading}
                        className="rounded-full"
                    >
                        {isLoading ? '載入中...' : '載入更多'}
                    </Button>
                </div>
            )}
        </div>
    );
}

interface DiscussionInputProps {
    onSubmit: (content: string, displayMode: 'real' | 'nickname' | 'anonymous') => void;
    isLoading?: boolean;
    placeholder?: string;
}

export function DiscussionInput({ onSubmit, isLoading, placeholder = '分享您的想法...' }: DiscussionInputProps) {
    const [content, setContent] = useState('');
    const [displayMode, setDisplayMode] = useState<'real' | 'nickname' | 'anonymous'>('real');

    const handleSubmit = () => {
        if (content.trim()) {
            onSubmit(content.trim(), displayMode);
            setContent('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
        }
    };

    return (
        <div className="bg-zinc-50 rounded-3xl p-4 space-y-3">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="min-h-[80px] resize-none border-0 bg-white rounded-2xl"
            />

            <div className="flex items-center justify-between">
                {/* Identity Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">以身分發佈：</span>
                    {(['real', 'anonymous'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setDisplayMode(mode)}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${displayMode === mode
                                ? 'bg-black text-white'
                                : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                                }`}
                        >
                            {mode === 'real' ? '真實姓名' : '匿名用戶'}
                        </button>
                    ))}
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || isLoading}
                    size="sm"
                    className="rounded-full"
                >
                    <Send className="w-4 h-4 mr-1" />
                    發佈
                </Button>
            </div>

            <p className="text-xs text-zinc-400">
                ⌘+Enter 快速發佈
            </p>
        </div>
    );
}

export default DiscussionList;
