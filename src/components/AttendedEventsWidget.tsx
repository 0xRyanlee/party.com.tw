'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, ChevronRight, CalendarCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface AttendedEvent {
    registration_id: string;
    checked_in: boolean;
    checked_in_at: string | null;
    event: {
        id: string;
        title: string;
        description: string | null;
        cover_image: string | null;
        start_datetime: string;
        end_datetime: string;
        location_name: string;
        organizer: {
            id: string;
            full_name: string | null;
            avatar_url: string | null;
        };
    };
}

interface AttendedEventsWidgetProps {
    limit?: number;
}

export default function AttendedEventsWidget({ limit = 3 }: AttendedEventsWidgetProps) {
    const [events, setEvents] = useState<AttendedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAttendedEvents() {
            try {
                const response = await fetch(`/api/user/attended-events?limit=${limit}`);
                if (response.ok) {
                    const data = await response.json();
                    setEvents(data);
                } else if (response.status === 401) {
                    // 未登入，不顯示錯誤
                    setEvents([]);
                } else {
                    setError('載入失敗');
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchAttendedEvents();
    }, [limit]);

    // 未登入或無數據時不顯示
    if (!loading && events.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-zinc-700">
                    <CalendarCheck className="w-5 h-5" />
                    <h3 className="font-bold">你參加過的活動</h3>
                </div>
                <Link
                    href="/user/my-events?tab=past"
                    className="text-xs text-zinc-500 hover:text-black flex items-center gap-1"
                >
                    查看全部
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="w-16 h-16 rounded-xl bg-zinc-100" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-zinc-100 rounded w-3/4" />
                                <div className="h-3 bg-zinc-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {events.map((item) => (
                        <Link
                            key={item.registration_id}
                            href={`/events/${item.event.id}`}
                            className="flex gap-3 group cursor-pointer hover:bg-zinc-50 -mx-2 px-2 py-2 rounded-xl transition-colors"
                        >
                            {/* Event Image */}
                            <div className="w-16 h-16 rounded-xl bg-zinc-100 overflow-hidden shrink-0">
                                {item.event.cover_image ? (
                                    <img
                                        src={item.event.cover_image}
                                        alt={item.event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                                        <History className="w-6 h-6 text-zinc-300" />
                                    </div>
                                )}
                            </div>

                            {/* Event Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate group-hover:text-zinc-600 transition-colors">
                                    {item.event.title}
                                </h4>
                                <p className="text-xs text-zinc-400 mt-1">
                                    {formatDistanceToNow(new Date(item.event.end_datetime), {
                                        addSuffix: true,
                                        locale: zhTW,
                                    })}
                                </p>
                                {item.checked_in && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 mt-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                        已簽到
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Empty State Hint */}
            {!loading && events.length === 0 && (
                <div className="text-center py-6">
                    <History className="w-10 h-10 text-zinc-200 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">尚無參加記錄</p>
                    <p className="text-xs text-zinc-300">你參加的活動會顯示在這裡</p>
                </div>
            )}
        </motion.div>
    );
}

