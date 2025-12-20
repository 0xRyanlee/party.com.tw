'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, Image as ImageIcon, MessageSquare, Clock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import StructuredImage from './common/StructuredImage';
import { Skeleton } from './Skeleton';
import { TicketTransferButton, TicketOfferMessage } from './TicketTransferChat';

interface Message {
    id: string;
    content: string;
    content_type: 'text' | 'image' | 'system' | 'ticket_transfer';
    metadata?: Record<string, any>;
    user_id: string;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
}

interface ChatRoomProps {
    eventId: string;
    currentUserId: string;
    eventStartTime: string;
    eventEndTime: string;
    isOrganizer: boolean;
}

export default function ChatRoom({
    eventId,
    currentUserId,
    eventStartTime,
    eventEndTime,
    isOrganizer
}: ChatRoomProps) {
    const supabase = createClient();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [accessError, setAccessError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const now = new Date();
    const startTime = new Date(eventStartTime);
    const endTime = new Date(eventEndTime);
    const windowStart = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
    const windowEnd = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);

    const isWithinWindow = now >= windowStart && now <= windowEnd;
    const isClosed = now > windowEnd;
    const isFuture = now < windowStart;

    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('messages')
                .select('*, profiles:user_id(full_name, avatar_url)')
                .eq('event_id', eventId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching messages:', error);
                if (error.code === '42501') {
                    setAccessError('您沒有進入此聊天室的權限，或聊天室已關閉。');
                }
            } else {
                setMessages(data || []);
            }
            setIsLoading(false);
        };

        fetchMessages();

        // Subscribe to additions
        const channel = supabase
            .channel(`room:${eventId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `event_id=eq.${eventId}`
            }, (payload: { new: Message }) => {
                const newMsg = payload.new;
                // Fetch profiles for the new message (Supabase Realtime doesn't join by default)
                fetchProfileAndAdd(newMsg);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [eventId, supabase]);

    const fetchProfileAndAdd = async (newMsg: Message) => {
        const { data } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newMsg.user_id)
            .single();

        const msgWithProfile = { ...newMsg, profiles: data };
        setMessages(prev => [...prev, msgWithProfile]);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending || !isWithinWindow) return;

        setIsSending(true);
        const { error } = await supabase
            .from('messages')
            .insert({
                event_id: eventId,
                user_id: currentUserId,
                content: newMessage.trim(),
                content_type: 'text'
            });

        if (error) {
            console.error('Error sending message:', error);
        } else {
            setNewMessage('');
        }
        setIsSending(false);
    };

    if (accessError && !isOrganizer) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                <ShieldAlert className="w-12 h-12 text-neutral-400 mb-4" />
                <h3 className="text-lg font-bold text-neutral-900 mb-2">權限受限</h3>
                <p className="text-neutral-500 text-center max-w-sm">{accessError}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-neutral-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Room 303</h3>
                        <p className="text-[10px] text-white/60 uppercase tracking-widest flex items-center gap-1">
                            {isClosed ? (
                                <><Clock className="w-3 h-3" /> ARCHIVED</>
                            ) : (
                                <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> LIVE</>
                            )}
                        </p>
                    </div>
                </div>
                {isOrganizer && isClosed && (
                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full text-white/80">主辦方封存模式</span>
                )}
            </div>

            {/* Message List */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-hide"
            >
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                <Skeleton className="h-10 w-48 rounded-2xl" />
                            </div>
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400 space-y-2">
                        <MessageSquare className="w-8 h-8 opacity-20" />
                        <p className="text-sm">尚無訊息，開始聊天吧！</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMine = msg.user_id === currentUserId;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-neutral-200 shrink-0 overflow-hidden border border-neutral-100">
                                    {msg.profiles?.avatar_url ? (
                                        <img src={msg.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                            {msg.profiles?.full_name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                    {!isMine && (
                                        <span className="text-[10px] text-neutral-500 mb-1 ml-1">{msg.profiles?.full_name || '參與者'}</span>
                                    )}
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMine
                                        ? 'bg-neutral-900 text-white rounded-tr-none'
                                        : 'bg-neutral-100 text-neutral-900 rounded-tl-none'
                                        }`}>
                                        {msg.content_type === 'ticket_transfer' ? (
                                            (() => {
                                                try {
                                                    const data = JSON.parse(msg.content);
                                                    return (
                                                        <TicketOfferMessage
                                                            offerId={data.offer_id}
                                                            fromUserId={msg.user_id}
                                                            fromUserName={msg.profiles?.full_name || '參與者'}
                                                            expiresAt={data.expires_at}
                                                            currentUserId={currentUserId}
                                                        />
                                                    );
                                                } catch {
                                                    return msg.content;
                                                }
                                            })()
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                    <span className="text-[9px] text-neutral-400 mt-1 px-1">
                                        {format(new Date(msg.created_at), 'HH:mm')}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            {isWithinWindow ? (
                <form onSubmit={handleSendMessage} className="p-4 bg-neutral-50 border-t border-neutral-100 flex gap-2">
                    <TicketTransferButton
                        eventId={eventId}
                        currentUserId={currentUserId}
                    />
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="輸入訊息..."
                        className="rounded-full bg-white border-none focus-visible:ring-neutral-200 h-11"
                        disabled={isSending}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="rounded-full w-11 h-11 bg-neutral-900 hover:bg-black shrink-0 shadow-lg shadow-neutral-200"
                        disabled={isSending || !newMessage.trim()}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            ) : (
                <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-center gap-2 text-neutral-500 text-xs">
                    <Clock className="w-4 h-4" />
                    {isFuture
                        ? `聊天室將在活動開始前 24h 開啟 (${format(windowStart, 'MM/dd HH:mm')})`
                        : '聊天室已關閉，僅供主辦方查看紀錄'
                    }
                </div>
            )}
        </div>
    );
}
