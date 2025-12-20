'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Ticket,
    QrCode,
    Calendar,
    MapPin,
    Clock,
    ChevronRight,
    Plus,
    ScanLine,
    Gift,
    AlertCircle,
    CheckCircle,
    X,
    Send,
    ExternalLink,
    Star,
    Loader2,
    Link2,
    Copy,
    Mail
} from 'lucide-react';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

type TicketStatus = 'upcoming' | 'used' | 'past' | 'cancelled';

interface UserTicket {
    id: string;
    eventId: string;
    eventTitle: string;
    eventImage?: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    checkinCode: string;
    status: TicketStatus;
    checkedInAt?: string;
    ticketType?: string;
}

// Inner component that uses useSearchParams
function WalletContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();

    const [tickets, setTickets] = useState<UserTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TicketStatus>('upcoming');
    const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [redeemCode, setRedeemCode] = useState('');
    const [redeemLoading, setRedeemLoading] = useState(false);
    const [redeemError, setRedeemError] = useState('');
    const [showReviewPrompt, setShowReviewPrompt] = useState<string | null>(null);

    // Transfer state
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferMode, setTransferMode] = useState<'qr' | 'link' | 'email'>('qr');
    const [transferEmail, setTransferEmail] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);
    const [transferError, setTransferError] = useState('');
    const [transferSuccess, setTransferSuccess] = useState(false);
    const [transferLink, setTransferLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    // Check for auto-redeem code in URL
    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            setRedeemCode(code.toUpperCase());
            setShowRedeemModal(true);
        }
    }, [searchParams]);

    // Fetch user's tickets
    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: registrations, error } = await supabase
                .from('registrations')
                .select(`
                    id,
                    event_id,
                    checkin_code,
                    checked_in,
                    checked_in_at,
                    status,
                    ticket_type_id,
                    events (
                        id,
                        title,
                        image,
                        date,
                        start_time,
                        location_name
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const transformedTickets: UserTicket[] = (registrations || []).map((reg: any) => {
                const event = reg.events;
                const eventDate = new Date(event?.date || Date.now());
                const now = new Date();

                let status: TicketStatus = 'upcoming';
                if (reg.status === 'cancelled') {
                    status = 'cancelled';
                } else if (reg.checked_in) {
                    status = 'used';
                } else if (eventDate < now) {
                    status = 'past';
                }

                return {
                    id: reg.id,
                    eventId: event?.id || '',
                    eventTitle: event?.title || '未知活動',
                    eventImage: event?.image,
                    eventDate: event?.date || '',
                    eventTime: event?.start_time || '',
                    eventLocation: event?.location_name || '',
                    checkinCode: reg.checkin_code || '',
                    status,
                    checkedInAt: reg.checked_in_at,
                    ticketType: reg.ticket_type_id,
                };
            });

            setTickets(transformedTickets);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (!redeemCode || redeemCode.length < 4) {
            setRedeemError('請輸入有效的兌換碼');
            return;
        }

        setRedeemLoading(true);
        setRedeemError('');

        try {
            const response = await fetch('/api/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: redeemCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '兌換失敗');
            }

            // Success - refresh tickets and close modal
            await fetchTickets();
            setShowRedeemModal(false);
            setRedeemCode('');

            // Remove code from URL if present
            router.replace('/wallet');
        } catch (error: any) {
            setRedeemError(error.message || '兌換失敗');
        } finally {
            setRedeemLoading(false);
        }
    };

    // Handle ticket transfer
    const handleTransfer = async () => {
        if (!selectedTicket || !transferEmail) return;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(transferEmail)) {
            setTransferError('請輸入有效的 Email 地址');
            return;
        }

        setTransferLoading(true);
        setTransferError('');

        try {
            const response = await fetch('/api/tickets/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: selectedTicket.id,
                    recipientEmail: transferEmail,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '轉送失敗');
            }

            setTransferSuccess(true);
            // Refresh tickets after transfer
            setTimeout(() => {
                setShowTransferModal(false);
                setSelectedTicket(null);
                setTransferEmail('');
                setTransferSuccess(false);
                fetchTickets();
            }, 2000);
        } catch (error: any) {
            setTransferError(error.message || '轉送失敗，請稍後重試');
        } finally {
            setTransferLoading(false);
        }
    };

    // Generate transfer link
    const generateTransferLink = async () => {
        if (!selectedTicket) return;

        setTransferLoading(true);
        setTransferError('');

        try {
            const response = await fetch('/api/tickets/transfer-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: selectedTicket.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '生成連結失敗');
            }

            setTransferLink(data.transferUrl);
        } catch (error: any) {
            setTransferError(error.message || '生成連結失敗，請稍後重試');
        } finally {
            setTransferLoading(false);
        }
    };

    // Get transfer URL for QR display
    const getTransferUrl = (ticket: UserTicket) => {
        if (typeof window === 'undefined') return '';
        return `${window.location.origin}/wallet/claim?ticket=${ticket.id}`;
    };

    // Copy transfer link to clipboard
    const handleCopyLink = async () => {
        if (!transferLink) return;
        try {
            await navigator.clipboard.writeText(transferLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const filteredTickets = tickets.filter(t => t.status === activeTab);

    const tabs: { key: TicketStatus; label: string; count: number }[] = [
        { key: 'upcoming', label: '即將參加', count: tickets.filter(t => t.status === 'upcoming').length },
        { key: 'used', label: '已使用', count: tickets.filter(t => t.status === 'used').length },
        { key: 'past', label: '已結束', count: tickets.filter(t => t.status === 'past').length },
        { key: 'cancelled', label: '已取消', count: tickets.filter(t => t.status === 'cancelled').length },
    ];

    const getCheckinUrl = (ticket: UserTicket) => {
        if (typeof window === 'undefined') return '';
        return `${window.location.origin}/user/my-events?checkin=${ticket.checkinCode}&event=${ticket.eventId}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                                <Ticket className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-xl">我的票夾</h1>
                                <p className="text-xs text-gray-500">管理您的票券與報名</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowRedeemModal(true)}
                            className="rounded-full bg-black text-white gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            新增票券
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto py-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key
                                    ? 'bg-black text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ticket List */}
            <div className="container mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-20">
                        <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">暫無此類票券</p>
                        <Button
                            onClick={() => setShowRedeemModal(true)}
                            variant="outline"
                            className="rounded-full gap-2"
                        >
                            <Gift className="w-4 h-4" />
                            兌換票券
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredTickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => {
                                    setSelectedTicket(ticket);
                                    // Show review prompt for used tickets
                                    if (ticket.status === 'used') {
                                        setShowReviewPrompt(ticket.eventId);
                                    }
                                }}
                                className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${ticket.status === 'past' || ticket.status === 'cancelled' ? 'opacity-60' : ''
                                    }`}
                            >
                                <div className="flex">
                                    {/* Event Image */}
                                    <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
                                        {ticket.eventImage ? (
                                            <img
                                                src={ticket.eventImage}
                                                alt={ticket.eventTitle}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Calendar className="w-8 h-8 text-gray-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Ticket Info */}
                                    <div className="flex-1 p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-sm truncate">{ticket.eventTitle}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{ticket.eventDate}</span>
                                                    {ticket.eventTime && (
                                                        <>
                                                            <Clock className="w-3 h-3 ml-1" />
                                                            <span>{ticket.eventTime}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate">{ticket.eventLocation}</span>
                                                </div>
                                            </div>
                                            <div className="ml-2 flex items-center gap-2">
                                                {ticket.status === 'upcoming' && (
                                                    <Badge className="bg-green-100 text-green-700 text-xs">有效</Badge>
                                                )}
                                                {ticket.status === 'used' && (
                                                    <Badge className="bg-blue-100 text-blue-700 text-xs">已使用</Badge>
                                                )}
                                                {ticket.status === 'past' && (
                                                    <Badge className="bg-gray-100 text-gray-500 text-xs">已結束</Badge>
                                                )}
                                                {ticket.status === 'cancelled' && (
                                                    <Badge className="bg-red-100 text-red-600 text-xs">已取消</Badge>
                                                )}
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>

                                        {/* Check-in Code Preview */}
                                        {ticket.status === 'upcoming' && ticket.checkinCode && (
                                            <div className="mt-2 flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1 w-fit">
                                                <QrCode className="w-3 h-3 text-gray-400" />
                                                <span className="font-mono text-xs text-gray-600">{ticket.checkinCode}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Compliance Notice */}
            <div className="container mx-auto px-4 pb-6">
                <div className="text-center text-xs text-gray-400">
                    <Link href="/terms" className="hover:underline">票券規則</Link>
                    <span className="mx-2">·</span>
                    <Link href="/privacy" className="hover:underline">隱私政策</Link>
                    <span className="mx-2">·</span>
                    <span>票券不可轉售牟利</span>
                </div>
            </div>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTicket(null)}>
                    <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-lg">票券詳情</h2>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Event Info */}
                            <div className="text-center">
                                <h3 className="font-bold text-xl">{selectedTicket.eventTitle}</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedTicket.eventDate} · {selectedTicket.eventTime}</p>
                                <p className="text-sm text-gray-400">{selectedTicket.eventLocation}</p>
                            </div>

                            {/* QR Code */}
                            {selectedTicket.status === 'upcoming' && (
                                <QRCodeGenerator
                                    value={getCheckinUrl(selectedTicket)}
                                    type="checkin"
                                    label="簽到專用"
                                    defaultErrorLevel="H"
                                    allowErrorLevelChange={false}
                                />
                            )}

                            {/* Check-in Code */}
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-xs text-gray-500 mb-1">簽到碼</p>
                                <p className="text-2xl font-bold font-mono tracking-widest">
                                    {selectedTicket.checkinCode}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <Link href={`/events/${selectedTicket.eventId}`}>
                                    <Button variant="outline" className="w-full rounded-full gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        查看活動詳情
                                    </Button>
                                </Link>

                                {selectedTicket.status === 'upcoming' && (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="w-full rounded-full gap-2"
                                            onClick={() => setShowTransferModal(true)}
                                        >
                                            <Send className="w-4 h-4" />
                                            轉送票券
                                        </Button>
                                        <p className="text-xs text-gray-400 text-center">
                                            轉送後此票券將失效，請確認對方資訊正確
                                        </p>
                                    </>
                                )}

                                {(selectedTicket.status === 'used' || selectedTicket.status === 'past') && (
                                    <Link href={`/events/${selectedTicket.eventId}?review=true`}>
                                        <Button className="w-full rounded-full bg-black text-white gap-2">
                                            <Star className="w-4 h-4" />
                                            評價此活動
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            {/* Disclaimer */}
                            <p className="text-xs text-gray-400 text-center">
                                本票券僅供個人使用，不可轉售牟利。詳見<Link href="/terms" className="underline">票券規則</Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Redeem Modal */}
            {showRedeemModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowRedeemModal(false)}>
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg">兌換票券</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowRedeemModal(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">輸入兌換碼或公關票碼</p>
                                <Input
                                    type="text"
                                    value={redeemCode}
                                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                                    placeholder="例如：PARTY2024"
                                    className="h-14 text-xl font-mono text-center uppercase tracking-widest"
                                    maxLength={20}
                                />
                            </div>

                            {redeemError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{redeemError}</span>
                                </div>
                            )}

                            <Button
                                onClick={handleRedeem}
                                disabled={redeemLoading || redeemCode.length < 4}
                                className="w-full h-12 rounded-full bg-black text-white"
                            >
                                {redeemLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    '兌換'
                                )}
                            </Button>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-gray-400">或</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-full gap-2"
                                onClick={() => {
                                    // TODO: Open QR scanner
                                    alert('掃碼功能開發中');
                                }}
                            >
                                <ScanLine className="w-5 h-5" />
                                掃描 QR Code 取票
                            </Button>
                        </div>

                        <p className="text-xs text-gray-400 text-center">
                            兌換碼通常由活動主辦方提供，成功兌換後票券會自動加入您的票夾
                        </p>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {showTransferModal && selectedTicket && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => !transferLoading && setShowTransferModal(false)}>
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg">轉送票券</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowTransferModal(false)} disabled={transferLoading}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {transferSuccess ? (
                            <div className="py-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">轉送成功！</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {transferMode === 'email'
                                            ? `票券已發送至 ${transferEmail}`
                                            : '對方領取後會自動轉移'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm font-medium">{selectedTicket.eventTitle}</p>
                                    <p className="text-xs text-gray-500 mt-1">{selectedTicket.eventDate} · {selectedTicket.eventTime}</p>
                                </div>

                                {/* Transfer Mode Tabs */}
                                <div className="flex gap-2 p-1 bg-gray-100 rounded-full">
                                    <button
                                        onClick={() => setTransferMode('qr')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-sm font-medium transition-all ${transferMode === 'qr' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <QrCode className="w-4 h-4" />
                                        QR 碼
                                    </button>
                                    <button
                                        onClick={() => { setTransferMode('link'); if (!transferLink) generateTransferLink(); }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-sm font-medium transition-all ${transferMode === 'link' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Link2 className="w-4 h-4" />
                                        連結
                                    </button>
                                    <button
                                        onClick={() => setTransferMode('email')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-sm font-medium transition-all ${transferMode === 'email' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </button>
                                </div>

                                {/* QR Mode */}
                                {transferMode === 'qr' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <QRCodeGenerator
                                                value={getTransferUrl(selectedTicket)}
                                                size={200}
                                                type="promotion"
                                                label="掃碼領取票券"
                                                showDownload={true}
                                                showCopy={false}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 text-center">
                                            請讓對方掃描此 QR 碼來領取票券
                                        </p>
                                    </div>
                                )}

                                {/* Link Mode */}
                                {transferMode === 'link' && (
                                    <div className="space-y-4">
                                        {transferLoading ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                            </div>
                                        ) : transferLink ? (
                                            <>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={transferLink}
                                                        readOnly
                                                        className="h-12 text-sm bg-gray-50"
                                                    />
                                                    <Button
                                                        onClick={handleCopyLink}
                                                        className="h-12 px-4 rounded-full"
                                                        variant={linkCopied ? 'default' : 'outline'}
                                                    >
                                                        {linkCopied ? (
                                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                                        ) : (
                                                            <Copy className="w-5 h-5" />
                                                        )}
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-gray-500 text-center">
                                                    複製連結並分享給對方，連結 24 小時內有效
                                                </p>
                                            </>
                                        ) : (
                                            <div className="text-center py-4">
                                                <Button onClick={generateTransferLink} className="rounded-full">
                                                    生成轉送連結
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Email Mode */}
                                {transferMode === 'email' && (
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">接收者 Email</label>
                                            <Input
                                                type="email"
                                                value={transferEmail}
                                                onChange={(e) => {
                                                    setTransferEmail(e.target.value);
                                                    setTransferError('');
                                                }}
                                                placeholder="recipient@example.com"
                                                className="h-12"
                                                disabled={transferLoading}
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-12 rounded-full"
                                                onClick={() => setShowTransferModal(false)}
                                                disabled={transferLoading}
                                            >
                                                取消
                                            </Button>
                                            <Button
                                                onClick={handleTransfer}
                                                disabled={transferLoading || !transferEmail}
                                                className="flex-1 h-12 rounded-full bg-black text-white"
                                            >
                                                {transferLoading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Send className="w-4 h-4 mr-2" />
                                                        確認轉送
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {transferError && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{transferError}</span>
                                    </div>
                                )}

                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                    <p className="text-xs text-amber-700">
                                        注意：轉送後此票券將從您的票夾移除且無法撤回，請確認接收者資訊正確。
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Review Prompt for Used Tickets */}
            {showReviewPrompt && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black text-white rounded-full px-6 py-3 shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-medium">活動結束了！來評價一下吧</span>
                    <Link href={`/events/${showReviewPrompt}?review=true`}>
                        <Button size="sm" className="bg-white text-black rounded-full hover:bg-gray-100">
                            評價
                        </Button>
                    </Link>
                    <button onClick={() => setShowReviewPrompt(null)} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

// Default export with Suspense boundary for useSearchParams
export default function WalletPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        }>
            <WalletContent />
        </Suspense>
    );
}
