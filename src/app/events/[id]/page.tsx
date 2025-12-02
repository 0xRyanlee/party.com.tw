'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Event } from '@/lib/mock-data';
import { Loader2, Calendar, MapPin, Clock, Share2, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';

export default function EventDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    const supabase = createClient();

    useEffect(() => {
        if (!id) return;

        const fetchEvent = async () => {
            try {
                const { data: dbEvent, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                if (dbEvent) {
                    const startDate = new Date(dbEvent.start_time);
                    const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const dayOfWeek = startDate.toLocaleDateString('en-US', { weekday: 'short' });
                    const timeStr = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

                    let priceDisplay = 'Free';
                    if (dbEvent.ticket_types && dbEvent.ticket_types.length > 0) {
                        const prices = dbEvent.ticket_types.map((t: any) => Number(t.price));
                        const minPrice = Math.min(...prices);
                        priceDisplay = minPrice === 0 ? 'Free' : `$${minPrice}`;
                    }

                    const mappedEvent: Event = {
                        id: dbEvent.id,
                        title: dbEvent.title,
                        type: dbEvent.category || 'event',
                        format: 'indoor',
                        attributes: dbEvent.tags || [],
                        date: new Date(dbEvent.start_time).toLocaleDateString(),
                        fullDate: dbEvent.start_time,
                        dayOfWeek: new Date(dbEvent.start_time).toLocaleDateString('en-US', { weekday: 'short' }),
                        time: new Date(dbEvent.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        location: dbEvent.venue_name || dbEvent.address || 'TBA',
                        lat: dbEvent.gps_lat || 25.0330,
                        lng: dbEvent.gps_lng || 121.5654,
                        distance: 0,
                        attendees: dbEvent.capacity_total - (dbEvent.capacity_remaining || 0),
                        capacity: dbEvent.capacity_total || 0,
                        image: dbEvent.cover_image || '',
                        tags: dbEvent.tags || [],
                        description: dbEvent.description_short || dbEvent.description_long || '',
                        price: dbEvent.ticket_types?.[0]?.price ? `NT$ ${dbEvent.ticket_types[0].price}` : 'Free',
                        organizer: {
                            id: dbEvent.organizer_id,
                            name: dbEvent.organizer_name || 'Organizer',
                            avatar: dbEvent.organizer_avatar,
                            role: 'member',
                            verified: dbEvent.organizer_verified
                        },
                        isPromoted: false,
                    };
                    setEvent(mappedEvent);
                }
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-background space-y-4">
                <p className="text-gray-500">找不到該活動</p>
                <Link href="/events">
                    <Button variant="outline">返回活動列表</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <Navigation />

            {/* Hero Image */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${event.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute top-24 left-4 md:left-8">
                    <Link href="/events">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 container mx-auto">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className="bg-white/20 text-white backdrop-blur-md border-none hover:bg-white/30">
                            {t(`types.${event.type}` as any)}
                        </Badge>
                        {event.attributes.map(attr => (
                            <Badge key={attr} variant="outline" className="text-white border-white/40 bg-black/20 backdrop-blur-md">
                                {attr}
                            </Badge>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
                    <div className="flex items-center gap-2 text-white/80 text-sm md:text-base">
                        <span className="font-medium text-[#06C755]">{event.price}</span>
                        <span>·</span>
                        <span>{event.attendees} 人已報名</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Info Cards */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-900">日期與時間</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{event.fullDate}</p>
                                    <p className="text-sm text-gray-500">{event.time}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-900">地點</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{event.location}</p>
                                    <p className="text-xs text-gray-400 mt-1">點擊查看地圖</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">關於活動</h2>
                            <div className="prose prose-gray max-w-none text-gray-600 whitespace-pre-line">
                                {event.description}
                            </div>
                        </div>

                        {/* Map Preview (Placeholder) */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">活動位置</h2>
                            <div className="h-64 bg-gray-100 rounded-2xl overflow-hidden relative">
                                {/* In a real app, integrate Google Maps Embed API here */}
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">
                                    <div className="text-center">
                                        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">地圖預覽</p>
                                        <p className="text-xs mt-1">{event.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-6">
                        {/* Organizer Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-500">主辦方</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-12 h-12 rounded-full bg-gray-200 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${event.organizer.avatar})` }}
                                />
                                <div>
                                    <div className="flex items-center gap-1">
                                        <h4 className="font-bold text-gray-900">{event.organizer.name}</h4>
                                        {event.organizer.verified && (
                                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">已舉辦 5 場活動</p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full rounded-full">關注主辦方</Button>
                        </div>

                        {/* Ticket Info (Desktop) */}
                        <div className="hidden lg:block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-500">票價</span>
                                <span className="text-2xl font-bold text-gray-900">{event.price}</span>
                            </div>
                            <Button className="w-full rounded-full bg-black text-white hover:bg-gray-800 h-12 text-lg">
                                立即報名
                            </Button>
                            <p className="text-xs text-center text-gray-400 mt-3">
                                剩餘名額: {event.capacity - event.attendees}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 lg:hidden z-50 safe-area-bottom">
                <div className="flex gap-3">
                    <Button variant="outline" size="icon" className="rounded-full w-12 h-12 shrink-0">
                        <Share2 className="w-5 h-5" />
                    </Button>
                    <Button className="flex-1 rounded-full bg-black text-white hover:bg-gray-800 h-12 text-lg">
                        立即報名 ({event.price})
                    </Button>
                </div>
            </div>
        </div>
    );
}
