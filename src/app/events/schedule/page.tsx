'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Trash2, QrCode, X, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface TimelineEvent {
    id: string;
    registrationId?: string;
    title: string;
    date: string;
    time: string;
    location: string;
    cover_image?: string;
    type: 'hosting' | 'attending';
    status: 'upcoming' | 'ongoing' | 'ended' | 'cancelled';
    checkin_code?: string;
}

interface HostingEvent {
    id: string;
    title: string;
    start_time: string | null;
    end_time: string | null;
    location_name: string | null;
    cover_image: string | null;
    status: string;
}

interface Registration {
    id: string;
    status: string;
    checkin_code?: string;
    event: {
        id: string;
        title: string;
        start_time: string | null;
        end_time: string | null;
        location_name: string | null;
        cover_image: string | null;
        status: string;
    } | null;
}

export default function SchedulePage() {
    const { user, loading: userLoading } = useUser();
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchSchedule();
        } else if (!userLoading) {
            setLoading(false);
        }
    }, [user, userLoading]);

    const fetchSchedule = async () => {
        const supabase = createClient();
        const now = new Date();

        try {
            // Fetch events user is hosting
            const { data: hostingEvents } = await supabase
                .from('events')
                .select('id, title, start_time, end_time, location_name, cover_image, status')
                .eq('host_id', user?.id)
                .order('start_time', { ascending: true });

            // Fetch events user is attending
            const { data: registrations } = await supabase
                .from('registrations')
                .select(`
                    id,
                    status,
                    checkin_code,
                    event:events(id, title, start_time, end_time, location_name, cover_image, status)
                `)
                .eq('user_id', user?.id);

            const getEventStatus = (startTime: string | null, endTime: string | null, eventStatus: string): TimelineEvent['status'] => {
                if (eventStatus === 'cancelled') return 'cancelled';
                if (!startTime) return 'upcoming';

                const start = new Date(startTime);
                const end = endTime ? new Date(endTime) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

                if (now > end) return 'ended';
                if (now >= start && now <= end) return 'ongoing';
                return 'upcoming';
            };

            const schedule: TimelineEvent[] = [
                ...(hostingEvents || []).map((e: HostingEvent) => ({
                    id: e.id,
                    title: e.title,
                    date: e.start_time ? new Date(e.start_time).toISOString().split('T')[0] : '',
                    time: e.start_time ? new Date(e.start_time).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '時間未定',
                    location: e.location_name || '未指定地點',
                    cover_image: e.cover_image || undefined,
                    type: 'hosting' as const,
                    status: getEventStatus(e.start_time, e.end_time, e.status),
                })),
                ...(registrations || [])
                    .filter((r: Registration) => r.event)
                    .map((r: Registration) => ({
                        id: r.event!.id,
                        registrationId: r.id,
                        title: r.event!.title,
                        date: r.event!.start_time ? new Date(r.event!.start_time).toISOString().split('T')[0] : '',
                        time: r.event!.start_time ? new Date(r.event!.start_time).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '時間未定',
                        location: r.event!.location_name || '未指定地點',
                        cover_image: r.event!.cover_image || undefined,
                        type: 'attending' as const,
                        status: r.status === 'cancelled' ? 'cancelled' as const : getEventStatus(r.event!.start_time, r.event!.end_time, r.event!.status),
                        checkin_code: r.checkin_code,
                    }))
            ];

            // Sort by date
            schedule.sort((a, b) => {
                const dateA = new Date(a.date || '9999-12-31');
                const dateB = new Date(b.date || '9999-12-31');
                return dateA.getTime() - dateB.getTime();
            });

            setEvents(schedule);
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRegistration = async (registrationId: string) => {
        if (!confirm('確定要取消報名嗎？')) return;

        const supabase = createClient();
        const { error } = await supabase
            .from('registrations')
            .update({ status: 'cancelled' })
            .eq('id', registrationId);

        if (error) {
            toast.error('取消失敗');
        } else {
            toast.success('已取消報名');
            fetchSchedule();
        }
    };

    const handleDeleteFromTimeline = async (event: TimelineEvent) => {
        setDeletingId(event.id);
        // Just remove from local state (soft delete from view)
        setTimeout(() => {
            setEvents(prev => prev.filter(e => e.id !== event.id));
            setDeletingId(null);
            toast.success('已從時間線移除');
        }, 300);
    };

    const handleShowVerificationCode = (event: TimelineEvent) => {
        // Navigate to wallet with the specific ticket
        window.location.href = `/wallet?eventId=${event.id}`;
    };

    // Group events by date
    const groupedEvents = events.reduce((groups, event) => {
        const date = event.date || '未定日期';
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(event);
        return groups;
    }, {} as Record<string, TimelineEvent[]>);

    const formatDateLabel = (dateStr: string) => {
        if (dateStr === '未定日期') return dateStr;

        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        if (isToday) return '今天';
        if (isTomorrow) return '明天';

        return date.toLocaleDateString('zh-TW', {
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
    };

    if (!userLoading && !user) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-bold mb-2">登入查看行程</h2>
                <p className="text-gray-500 mb-6">登入後可查看您報名和主辦的活動時間線</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                    行程時間線
                </h1>
                <p className="text-sm text-gray-500 mt-1">您的活動一目瞭然</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-16">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">尚無活動排程</h3>
                    <p className="text-gray-500 mb-6">去探索更多有趣的活動吧！</p>
                    <Link href="/events">
                        <Button className="rounded-full">探索活動</Button>
                    </Link>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-gray-200 to-transparent" />

                    {/* Timeline Items */}
                    <div className="space-y-8">
                        {Object.entries(groupedEvents).map(([date, dateEvents], groupIndex) => (
                            <div key={date}>
                                {/* Date Label */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200 z-10">
                                        <Calendar className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-lg text-gray-900">
                                        {formatDateLabel(date)}
                                    </span>
                                </div>

                                {/* Events for this date */}
                                <div className="ml-12 space-y-3">
                                    <AnimatePresence>
                                        {dateEvents.map((event, index) => {
                                            const isInactive = event.status === 'ended' || event.status === 'cancelled';
                                            const isDeleting = deletingId === event.id;

                                            return (
                                                <motion.div
                                                    key={event.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{
                                                        opacity: isDeleting ? 0 : 1,
                                                        x: isDeleting ? -50 : 0,
                                                        scale: isDeleting ? 0.9 : 1
                                                    }}
                                                    exit={{ opacity: 0, x: -50 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`relative bg-white rounded-2xl border shadow-sm overflow-hidden ${isInactive
                                                            ? 'border-gray-200 opacity-60'
                                                            : event.status === 'ongoing'
                                                                ? 'border-emerald-300 shadow-emerald-100'
                                                                : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                                                        } transition-all`}
                                                >
                                                    {/* Ongoing indicator */}
                                                    {event.status === 'ongoing' && (
                                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
                                                    )}

                                                    <div className="p-4">
                                                        <div className="flex gap-4">
                                                            {/* Cover Image */}
                                                            {event.cover_image && (
                                                                <img
                                                                    src={event.cover_image}
                                                                    alt={event.title}
                                                                    className={`w-20 h-20 rounded-xl object-cover ${isInactive ? 'grayscale' : ''}`}
                                                                />
                                                            )}

                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    {/* Type Badge */}
                                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${event.type === 'hosting'
                                                                            ? 'bg-black text-white'
                                                                            : 'bg-gray-100 text-gray-600'
                                                                        }`}>
                                                                        {event.type === 'hosting' ? '👑 主辦' : '參加'}
                                                                    </span>

                                                                    {/* Status Badge */}
                                                                    {event.status === 'ongoing' && (
                                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                            進行中
                                                                        </span>
                                                                    )}
                                                                    {event.status === 'ended' && (
                                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                                            已結束
                                                                        </span>
                                                                    )}
                                                                    {event.status === 'cancelled' && (
                                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                                                            已取消
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <Link href={`/events/${event.id}`}>
                                                                    <h3 className={`font-bold text-base mb-1 hover:underline ${isInactive ? 'text-gray-500' : 'text-gray-900'}`}>
                                                                        {event.title}
                                                                    </h3>
                                                                </Link>

                                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        <span>{event.time}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="w-3.5 h-3.5" />
                                                                        <span className="truncate max-w-[120px]">{event.location}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Action Buttons - Only for active attending events */}
                                                                {!isInactive && event.type === 'attending' && (
                                                                    <div className="flex gap-2 mt-3">
                                                                        <Button
                                                                            size="sm"
                                                                            className="rounded-full text-xs gap-1 h-8"
                                                                            onClick={() => handleShowVerificationCode(event)}
                                                                        >
                                                                            <QrCode className="w-3.5 h-3.5" />
                                                                            出示驗證碼
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="rounded-full text-xs gap-1 h-8 text-red-600 border-red-200 hover:bg-red-50"
                                                                            onClick={() => event.registrationId && handleCancelRegistration(event.registrationId)}
                                                                        >
                                                                            <XCircle className="w-3.5 h-3.5" />
                                                                            取消報名
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Delete Button - Only for inactive events */}
                                                            {isInactive && (
                                                                <button
                                                                    onClick={() => handleDeleteFromTimeline(event)}
                                                                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
