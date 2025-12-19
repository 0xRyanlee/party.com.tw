"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronRight } from 'lucide-react';
import OnboardingModal from '@/components/OnboardingModal';
import AuthModal from '@/components/AuthModal';
import { tags, Event } from '@/lib/mock-data';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { useLanguage } from '@/lib/i18n';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import HeroCarousel from '@/components/HeroCarousel';
import MapModal from '@/components/MapModal';
import QuickActions from '@/components/QuickActions';
import CategoryFilter from '@/components/CategoryFilter';
import { Suspense } from 'react';
import AttendedEventsWidget from '@/components/AttendedEventsWidget';

interface HomeClientProps {
    initialEvents: Event[];
}

function HomeContent({ initialEvents }: HomeClientProps) {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [events, setEvents] = useState<Event[]>(initialEvents);

    // Filter active events only
    const activeEvents = useMemo(() => {
        return events.filter(e => e.status === 'active' || e.status === 'published');
    }, [events]);

    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [sortMode, setSortMode] = useState<'upcoming' | 'nearby' | 'both'>('both');

    const handleToggleTag = (tag: string) => {
        setActiveTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    // Handle login param
    useEffect(() => {
        if (searchParams.get('login') === 'true') {
            setIsAuthModalOpen(true);
        }
    }, [searchParams]);

    // Filter and Sort Logic
    const filteredEvents = useMemo(() => {
        return events
            .filter((event) => {
                const matchesTag = activeTags.length === 0 ||
                    event.tags.some(tag => activeTags.includes(tag)) ||
                    activeTags.includes(event.type);
                const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    event.location.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesTag && matchesSearch;
            })
            .sort((a, b) => {
                if (sortMode === 'nearby') {
                    return (a.distance || 0) - (b.distance || 0);
                } else if (sortMode === 'upcoming') {
                    return (a.fullDate || '').localeCompare(b.fullDate || '');
                } else {
                    if ((a.distance || 0) !== (b.distance || 0)) return (a.distance || 0) - (b.distance || 0);
                    return (a.fullDate || '').localeCompare(b.fullDate || '');
                }
            });
    }, [events, activeTags, searchQuery, sortMode]);

    const otherEvents = filteredEvents.slice(0, 8);

    return (
        <main className="min-h-screen bg-gray-50/50 text-black pb-24 md:pb-12 relative overflow-hidden flex flex-col">

            {/* Map Visual Cue (Background Hint) */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-neutral-50/30 -z-10 overflow-hidden opacity-0 md:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-gray-50/50 to-transparent" />
            </div>

            <PageTransition className="container mx-auto px-4 py-6 md:py-8 max-w-7xl flex-1">

                {/* Hero Carousel */}
                <HeroCarousel
                    events={activeEvents.slice(0, 3).map(e => ({
                        id: e.id,
                        title: e.title,
                        location: e.location,
                        date: e.date,
                        imageUrl: e.image,
                        tags: e.tags.slice(0, 3),
                    }))}
                />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6 lg:gap-8">
                    {/* Left Column - Main Feed */}
                    <div className="lg:col-span-8 space-y-3 md:space-y-6 lg:space-y-8">

                        {/* Category Filter */}
                        <CategoryFilter
                            tags={tags}
                            activeTags={activeTags}
                            onToggleTag={handleToggleTag}
                        />

                        {/* Sort Mode Toggle */}
                        <div className="flex items-center gap-2 px-1">
                            <span className="text-xs text-gray-400 mr-2">排序：</span>
                            {(['upcoming', 'nearby', 'both'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setSortMode(mode)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${sortMode === mode
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {mode === 'upcoming' ? '時間優先' : mode === 'nearby' ? '距離優先' : '綜合'}
                                </button>
                            ))}
                        </div>

                        {/* Main Feed Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-sm font-bold text-gray-500 tracking-wider">
                                    {sortMode === 'nearby' ? 'NEARBY EVENTS' : sortMode === 'upcoming' ? 'UPCOMING EVENTS' : 'FOR YOU'}
                                </h2>
                            </div>

                            {otherEvents.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {otherEvents.map((event) => (
                                        <Link
                                            key={event.id}
                                            href={`/events/${event.id}`}
                                            className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex gap-4 active:scale-[0.99]"
                                        >
                                            {/* Image */}
                                            <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl bg-zinc-200 relative overflow-hidden">
                                                {event.image ? (
                                                    <img
                                                        src={event.image}
                                                        alt={event.title}
                                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 bg-zinc-300 flex items-center justify-center">
                                                        <span className="text-zinc-500 text-xs">No image</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm z-10">
                                                    {event.date}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                                        {event.tags.slice(0, 2).map(tag => (
                                                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <h3 className="font-bold text-base text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-1">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                                                        {event.location}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-2">
                                                        {event.organizer?.avatar && (
                                                            <div
                                                                className="w-5 h-5 rounded-full bg-gray-200 bg-cover bg-center"
                                                                style={{ backgroundImage: `url(${event.organizer.avatar})` }}
                                                            />
                                                        )}
                                                        <span className="text-xs text-gray-600 font-medium">{event.organizer?.name || 'Organizer'}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-600">
                                                        {event.dayOfWeek} {event.time}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                    <p className="text-gray-500">目前沒有活動</p>
                                    <Link href="/host/edit" className="text-black font-medium mt-2 inline-block">
                                        創建第一個活動
                                    </Link>
                                </div>
                            )}

                            {/* Load More Button */}
                            {otherEvents.length > 0 && (
                                <div className="flex justify-center pt-4">
                                    <Link href="/events">
                                        <Button variant="ghost" className="text-gray-500 hover:text-black hover:bg-gray-100 rounded-full text-sm">
                                            查看更多 <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </motion.section>

                        {/* Weekly Calendar */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <WeeklyCalendar />
                        </motion.section>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-4 space-y-6 lg:space-y-8 px-4 sm:px-0">

                        {/* Attended Events Widget */}
                        <AttendedEventsWidget limit={3} />

                        {/* Actions Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.35 }}
                        >
                            <QuickActions />
                        </motion.div>

                        {/* Map Preview Widget */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            onClick={() => setIsMapOpen(true)}
                            className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm h-[250px] relative overflow-hidden group cursor-pointer"
                        >
                            <div className="absolute inset-2 rounded-xl overflow-hidden bg-neutral-100">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white/80 text-xs font-medium mb-1">地圖預覽</p>
                                            <h3 className="text-white text-lg font-bold">探索附近活動</h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-white/60 text-xs mt-2">{events.length} 個活動可探索</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Stats */}
                        <div className="bg-neutral-900 text-white rounded-2xl p-6">
                            <h3 className="text-lg font-bold mb-2">{t('home.sidebar.yourVibe')}</h3>
                            <p className="text-gray-400 text-sm mb-4">探索更多符合你風格的活動</p>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl text-sm">
                                    <span>熱門標籤</span>
                                    <span className="font-bold">Tech, Party</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PageTransition>

            {showOnboarding && (
                <div onClick={() => setShowOnboarding(false)}>
                    <OnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} />
                </div>
            )}

            {/* Map Modal */}
            <MapModal
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                events={filteredEvents}
            />

            {/* Auth Modal */}
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </main>
    );
}

export default function HomeClient({ initialEvents }: HomeClientProps) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-4 border-neutral-200 border-t-neutral-900 animate-spin" />
                    <p className="text-neutral-500 font-medium animate-pulse">載入中...</p>
                </div>
            </div>
        }>
            <HomeContent initialEvents={initialEvents} />
        </Suspense>
    );
}
