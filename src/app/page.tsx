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
  const [activeTag, setActiveTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);

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
        const matchesTag = activeTag === 'All' || event.tags.includes(activeTag) || event.type === activeTag.toLowerCase();
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTag && matchesSearch;
      })
      .sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        return 0;
      });
  }, [activeTag, searchQuery]);

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

        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Main Feed */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">

            {/* Category Filter */}
            <CategoryFilter
              tags={tags}
              activeTag={activeTag}
              onSelectTag={setActiveTag}
            />

            {/* Upcoming Events Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-bold text-gray-500 tracking-wider">{t('home.upcoming')}</h2>
              </div>

              {/* Foolproof Carousel Container */}
              <div className="relative -mx-4 sm:mx-0">
                {/* Left Fade Gradient */}
                <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none hidden sm:block" />
                {/* Right Fade Gradient */}
                <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none" />

                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 sm:pb-8 pt-2 px-4 sm:px-0 scrollbar-hide snap-x clip-path-padding">
                  {otherEvents.map((event) => (
                    <div
                      key={event.id}
                      className="min-w-[280px] sm:min-w-[320px] lg:min-w-[22%] snap-start shrink-0 bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer group/card flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/card:scale-110"
                          style={{ backgroundImage: `url(${event.image})` }}
                        />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                          {event.date}
                        </div>
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <h4 className="font-bold text-sm truncate mb-1 group-hover/card:text-gray-600 transition-colors">{event.title}</h4>

                        {/* Organizer & Vendors */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded-full bg-gray-200 bg-cover bg-center border border-white"
                              style={{ backgroundImage: `url(${event.organizer.avatar})` }}
                            />
                            <span className="text-[10px] text-gray-600 font-medium truncate max-w-[80px]">
                              {event.organizer.name}
                            </span>
                            {event.organizer.verified && (
                              <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          {event.vendors && event.vendors.length > 0 && (
                            <div className="flex items-center gap-0.5 ml-auto">
                              <div className="flex -space-x-1">
                                {event.vendors.slice(0, 2).map((vendor, idx) => (
                                  <div
                                    key={vendor.id}
                                    className="w-4 h-4 rounded-full bg-gray-200 bg-cover bg-center border border-white"
                                    style={{ backgroundImage: `url(${vendor.avatar})` }}
                                  />
                                ))}
                              </div>
                              <span className="text-[9px] text-gray-400 font-medium">+{event.vendors.length}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-auto flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{event.location.split(',')[0]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Spacer for end of list */}
                  <div className="w-8 shrink-0" />
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
