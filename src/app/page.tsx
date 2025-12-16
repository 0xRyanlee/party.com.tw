"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ChevronRight, History, Map as MapIcon } from 'lucide-react';
import OnboardingModal from '@/components/OnboardingModal';
import AuthModal from '@/components/AuthModal';
import { mockEvents, tags } from '@/lib/mock-data';
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

function HomeContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // Filter active events only
  const activeEvents = useMemo(() => {
    return mockEvents.filter(e => e.status === 'active');
  }, []);

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

  // 處理登入參數
  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setIsAuthModalOpen(true);
    }
  }, [searchParams]);

  // Filter and Sort Logic
  const filteredEvents = useMemo(() => {
    return mockEvents
      .filter((event) => {
        // 空陣列 = 顯示全部
        const matchesTag = activeTags.length === 0 ||
          event.tags.some(tag => activeTags.includes(tag)) ||
          activeTags.includes(event.type);
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTag && matchesSearch;
      })
      .sort((a, b) => {
        if (sortMode === 'nearby') {
          // 按距離排序
          return a.distance - b.distance;
        } else if (sortMode === 'upcoming') {
          // 按日期排序（假設 date 是可排序的字串）
          return a.date.localeCompare(b.date);
        } else {
          // both: 綜合排序（距離優先，距離相同則按日期）
          if (a.distance !== b.distance) return a.distance - b.distance;
          return a.date.localeCompare(b.date);
        }
      });
  }, [activeTags, searchQuery, sortMode]);

  const nearestEvent = filteredEvents[0];
  const otherEvents = filteredEvents.slice(1);

  return (
    <main className="min-h-screen bg-gray-50/50 text-black pb-20 md:pb-12 relative overflow-hidden flex flex-col">

      {/* Map Visual Cue (Background Hint) */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-emerald-50/30 -z-10 overflow-hidden opacity-0 md:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 opacity-5 bg-[url('https://docs.mapbox.com/mapbox-gl-js/assets/streets-v11.png')] bg-cover bg-center" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-gray-50/50 to-transparent" />
      </div>

      <PageTransition className="container mx-auto px-4 py-6 md:py-8 max-w-7xl flex-1">
        {/* 移除本地 header，使用全局 Header */}

        {/* Hero Carousel - 使用前 3 個活動作為 Banner */}
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

            {/* Main Feed Section (List View) */}
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

              <div className="flex flex-col gap-2 md:gap-4 lg:gap-6">
                {otherEvents.slice(0, 5).map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 hover:shadow-lg transition-all cursor-pointer group flex gap-3 md:gap-4 lg:gap-6 active:scale-[0.99]"
                  >
                    {/* Image (Left) */}
                    <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 shrink-0 rounded-lg md:rounded-xl bg-gray-200 relative overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${event.image})` }}
                      />
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                        {event.date}
                      </div>
                    </div>

                    {/* Content (Right) */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {event.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                          {event.location}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Organizer */}
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full bg-gray-200 bg-cover bg-center"
                            style={{ backgroundImage: `url(${event.organizer.avatar})` }}
                          />
                          <span className="text-xs text-gray-600 font-medium">{event.organizer.name}</span>
                        </div>

                        {/* Distance + Date/Time */}
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <span className="text-gray-400">
                            {event.distance < 1 ? `${Math.round(event.distance * 1000)}m` : `${event.distance.toFixed(1)}km`}
                          </span>
                          <span className="text-gray-600">
                            {event.dayOfWeek} {event.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More Button (Mock) */}
              <div className="flex justify-center pt-4">
                <Button variant="ghost" className="text-gray-500 hover:text-black hover:bg-gray-100 rounded-full text-sm">
                  Show More <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.section>

            {/* Recommendation Carousel (Moved below list) */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative space-y-4 pt-4 border-t border-gray-100"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-gray-500 tracking-wider">
                  DISCOVER MORE
                </h2>
                <Link href="/discover" className="text-xs font-medium text-gray-400 hover:text-black flex items-center">
                  See All <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              {/* Foolproof Carousel Container */}
              <div className="relative -mx-4 sm:mx-0">
                <div className="flex gap-2 md:gap-4 overflow-x-auto pb-4 md:pb-6 pt-2 px-4 sm:px-0 scrollbar-hide snap-x">
                  {/* Show events from index 5 onwards, or mock recommendations */}
                  {otherEvents.slice(5).concat(activeEvents.slice(0, 3)).map((event) => (
                    <Link
                      key={`rec-${event.id}`}
                      href={`/events/${event.id}`}
                      className="min-w-[calc((100vw-48px)/3.6)] md:min-w-[200px] lg:min-w-[240px] snap-start shrink-0 bg-white rounded-lg md:rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer group/card flex flex-col active:scale-[0.98]"
                    >
                      <div className="aspect-[4/3] md:aspect-[16/9] bg-gray-200 relative overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/card:scale-110"
                          style={{ backgroundImage: `url(${event.image})` }}
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-white">
                          {event.type}
                        </div>
                      </div>
                      <div className="p-2 flex flex-col">
                        <h4 className="font-bold text-xs md:text-sm truncate text-gray-900">{event.title}</h4>
                        <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-500 mt-1">
                          <span className="truncate max-w-[80px]">{event.location.split(',')[0]}</span>
                          <span className="text-gray-400">{event.dayOfWeek} {event.time}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="w-4 shrink-0" />
                </div>
              </div>
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

            {/* Attended Events Widget (P0 - UX Roadmap) */}
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
              className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm h-[250px] sm:h-[300px] relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-2 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://docs.mapbox.com/mapbox-gl-js/assets/streets-v11.png')] bg-cover bg-center transition-transform duration-200 group-hover:scale-105 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">地圖預覽</p>
                      <h3 className="text-white text-sm sm:text-lg font-bold">探索附近活動</h3>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-white/60 text-[10px] sm:text-xs mt-1 sm:mt-2">2公里內有 {mockEvents.length} 個活動</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </motion.div>

            {/* Quick Stats */}
            <div className="bg-gray-900 text-white rounded-lg p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold mb-2">{t('home.sidebar.yourVibe')}</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">You've joined 3 events this month.</p>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center p-2 sm:p-3 bg-white/10 rounded-xl text-xs sm:text-sm">
                  <span>Hot Tags</span>
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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-neutral-200 border-t-neutral-900 animate-spin" />
          <p className="text-neutral-500 font-medium animate-pulse">Loading experience...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
