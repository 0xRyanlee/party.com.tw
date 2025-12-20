'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
    Ticket,
    Send,
    Check,
    X,
    Loader2,
    Gift,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface UserTicket {
    id: string;
    event_id: string;
    checkin_code: string;
    status: string;
    event?: {
        id: string;
        title: string;
        start_time: string;
        cover_image?: string;
    };
}

interface TransferOffer {
    id: string;
    ticket_id: string;
    from_user_id: string;
    to_user_id: string | null;
    status: 'pending' | 'accepted' | 'cancelled' | 'expired';
    event_id: string;
    message_id?: string;
    created_at: string;
    expires_at: string;
    ticket?: {
        event?: {
            title: string;
        };
    };
    from_user?: {
        full_name: string;
        avatar_url: string;
    };
}

interface TicketTransferChatProps {
    eventId: string;
    currentUserId: string;
    isWithinWindow: boolean;
}

// Component for initiating ticket transfer in chat
export function TicketTransferButton({
    eventId,
    currentUserId,
    onOfferCreated
}: {
    eventId: string;
    currentUserId: string;
    onOfferCreated?: (offerId: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [tickets, setTickets] = useState<UserTicket[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    const supabase = createClient();

    const fetchMyTickets = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select(`
                    id,
                    event_id,
                    checkin_code,
                    status,
                    event:events(id, title, start_time, cover_image)
                `)
                .eq('user_id', currentUserId)
                .eq('event_id', eventId)
                .eq('status', 'confirmed')
                .is('transferred_to', null);

            if (!error && data) {
                setTickets(data);
            }
        } catch (err) {
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMyTickets();
        }
    }, [isOpen]);

    const handleCreateOffer = async () => {
        if (!selectedTicketId) return;

        setCreating(true);
        try {
            // Create transfer offer with 30-minute expiry
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('ticket_transfer_offers')
                .insert({
                    ticket_id: selectedTicketId,
                    from_user_id: currentUserId,
                    event_id: eventId,
                    status: 'pending',
                    expires_at: expiresAt,
                })
                .select()
                .single();

            if (error) throw error;

            // Send a special message to the chat
            await supabase
                .from('messages')
                .insert({
                    event_id: eventId,
                    user_id: currentUserId,
                    content: JSON.stringify({
                        type: 'ticket_offer',
                        offer_id: data.id,
                        ticket_id: selectedTicketId,
                        expires_at: expiresAt,
                    }),
                    content_type: 'ticket_transfer',
                    metadata: { offer_id: data.id }
                });

            toast.success('票券轉讓邀請已發送！');
            onOfferCreated?.(data.id);
            setIsOpen(false);
        } catch (err: any) {
            console.error('Error creating offer:', err);
            toast.error(err.message || '發送失敗');
        } finally {
            setCreating(false);
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="rounded-full w-11 h-11 shrink-0"
                title="轉讓票券"
            >
                <Gift className="w-5 h-5" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-sm rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Ticket className="w-5 h-5" />
                            轉讓票券
                        </DialogTitle>
                        <DialogDescription>
                            選擇要轉讓的票券，聊天室中的參與者可接受
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Ticket className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">您沒有可轉讓的票券</p>
                            </div>
                        ) : (
                            tickets.map((ticket) => (
                                <button
                                    key={ticket.id}
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${selectedTicketId === ticket.id
                                            ? 'border-black bg-gray-50'
                                            : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                            <Ticket className="w-6 h-6 text-gray-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {ticket.event?.title || '活動票券'}
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono">
                                                #{ticket.checkin_code}
                                            </p>
                                        </div>
                                        {selectedTicketId === ticket.id && (
                                            <Check className="w-5 h-5 text-black" />
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {tickets.length > 0 && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 rounded-full"
                            >
                                取消
                            </Button>
                            <Button
                                onClick={handleCreateOffer}
                                disabled={!selectedTicketId || creating}
                                className="flex-1 rounded-full bg-black text-white"
                            >
                                {creating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        發送邀請
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 text-center mt-2">
                        邀請將在 30 分鐘後過期
                    </p>
                </DialogContent>
            </Dialog>
        </>
    );
}

// Component for displaying ticket transfer offer message
export function TicketOfferMessage({
    offerId,
    fromUserId,
    fromUserName,
    expiresAt,
    currentUserId,
    onAccept,
}: {
    offerId: string;
    fromUserId: string;
    fromUserName: string;
    expiresAt: string;
    currentUserId: string;
    onAccept?: () => void;
}) {
    const [status, setStatus] = useState<'pending' | 'accepted' | 'expired' | 'loading'>('pending');
    const supabase = createClient();

    const isExpired = new Date(expiresAt) < new Date();
    const isFromMe = fromUserId === currentUserId;

    useEffect(() => {
        if (isExpired && status === 'pending') {
            setStatus('expired');
        }
    }, [isExpired, status]);

    const handleAccept = async () => {
        if (isFromMe || isExpired) return;

        setStatus('loading');
        try {
            const { error } = await supabase
                .from('ticket_transfer_offers')
                .update({
                    to_user_id: currentUserId,
                    status: 'accepted',
                })
                .eq('id', offerId)
                .eq('status', 'pending');

            if (error) throw error;

            // Transfer the ticket
            const { data: offer } = await supabase
                .from('ticket_transfer_offers')
                .select('ticket_id')
                .eq('id', offerId)
                .single();

            if (offer) {
                await supabase
                    .from('registrations')
                    .update({
                        user_id: currentUserId,
                        transferred_at: new Date().toISOString(),
                    })
                    .eq('id', offer.ticket_id);
            }

            setStatus('accepted');
            toast.success('票券領取成功！');
            onAccept?.();
        } catch (err: any) {
            console.error('Error accepting offer:', err);
            toast.error('領取失敗，可能已被其他人領取');
            setStatus('expired');
        }
    };

    if (status === 'expired' || isExpired) {
        return (
            <div className="bg-gray-100 rounded-2xl p-4 max-w-[280px]">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Gift className="w-4 h-4" />
                    <span className="text-xs font-medium">票券轉讓</span>
                </div>
                <p className="text-sm text-gray-400">此轉讓邀請已過期</p>
            </div>
        );
    }

    if (status === 'accepted') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 max-w-[280px]">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-medium">已領取</span>
                </div>
                <p className="text-sm text-green-700">票券已成功轉讓</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 max-w-[280px]">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
                <Gift className="w-4 h-4" />
                <span className="text-xs font-medium">票券轉讓邀請</span>
            </div>
            <p className="text-sm text-gray-700 mb-3">
                {isFromMe ? '您發送了票券轉讓邀請' : `${fromUserName} 想要轉讓票券給您`}
            </p>

            {!isFromMe && (
                <Button
                    onClick={handleAccept}
                    disabled={status === 'loading'}
                    size="sm"
                    className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white"
                >
                    {status === 'loading' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <Check className="w-4 h-4 mr-1" />
                            領取票券
                        </>
                    )}
                </Button>
            )}

            <p className="text-[10px] text-gray-400 mt-2 text-center">
                有效期至 {new Date(expiresAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    );
}

export default TicketTransferButton;
