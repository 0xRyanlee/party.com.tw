'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';

interface ScheduleEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    type: 'hosting' | 'attending';
}

interface HostingEvent {
    id: string;
    title: string;
    start_date: string;
    start_time: string | null;
    venue_name: string | null;
}

interface Registration {
    event: HostingEvent | null;
}

export default function SchedulePage() {
    const { user, loading: userLoading } = useUser();
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        if (user) {
            fetchSchedule();
        } else if (!userLoading) {
            setLoading(false);
        }
    }, [user, userLoading]);

    const fetchSchedule = async () => {
        const supabase = createClient();

        try {
            // Fetch events user is hosting
            const { data: hostingEvents } = await supabase
                .from('events')
                .select('id, title, start_date, start_time, venue_name')
                .eq('host_id', user?.id)
                .order('start_date', { ascending: true });

            // Fetch events user is attending
            const { data: registrations } = await supabase
                .from('registrations')
                .select('event:events(id, title, start_date, start_time, venue_name)')
                .eq('user_id', user?.id)
                .eq('status', 'confirmed');


            const schedule: ScheduleEvent[] = [
                ...(hostingEvents || []).map((e: HostingEvent) => ({
                    id: e.id,
                    title: e.title,
                    date: e.start_date,
                    time: e.start_time || '00:00',
                    location: e.venue_name || '未指定地點',
                    type: 'hosting' as const
                })),
                ...(registrations || [])
                    .filter((r: Registration) => r.event)
                    .map((r: Registration) => ({
                        id: r.event!.id,
                        title: r.event!.title,
                        date: r.event!.start_date,
                        time: r.event!.start_time || '00:00',
                        location: r.event!.venue_name || '未指定地點',
                        type: 'attending' as const
                    }))
            ];

            setEvents(schedule);
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const monthName = currentMonth.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    // Filter events for current month
    const monthEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.getMonth() === currentMonth.getMonth() &&
            eventDate.getFullYear() === currentMonth.getFullYear();
    });

    if (!userLoading && !user) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-bold mb-2">登入查看排程</h2>
                <p className="text-gray-500 mb-6">登入後可查看您報名和主辦的活動排程</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold tracking-tight">我的排程</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-full">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-medium min-w-[120px] text-center">{monthName}</span>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-full">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
                    ))}
                </div>
            ) : monthEvents.length === 0 ? (
                <div className="text-center py-16">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">本月沒有活動</h3>
                    <p className="text-gray-500 mb-6">去探索更多有趣的活動吧！</p>
                    <Link href="/events">
                        <Button className="rounded-full">探索活動</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {monthEvents
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((event) => (
                            <Link
                                key={event.id}
                                href={`/events/${event.id}`}
                                className="block"
                            >
                                <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition-all hover:shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${event.type === 'hosting'
                                                    ? 'bg-black text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {event.type === 'hosting' ? '主辦' : '參加'}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {new Date(event.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })} {event.time}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{event.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                </div>
            )}
        </div>
    );
}
