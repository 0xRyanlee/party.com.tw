"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, ChevronRight, Bell, User, Plus, History, Map as MapIcon, Briefcase, Users } from 'lucide-react';
import OnboardingModal from '@/components/OnboardingModal';
import { mockEvents, tags } from '@/lib/mock-data';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { useLanguage } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import HeroCarousel from '@/components/HeroCarousel';
import MapModal from '@/components/MapModal';

export default function Home() {
  const { t } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTag, setActiveTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);

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
        {/* Top Header Area: Logo, Tagline, Nav, Search */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="flex flex-col gap-1">
            <Logo />
            <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase pl-1">
              {t('home.tagline')}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-4 md:gap-6 mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <Link href="/" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black text-white text-xs sm:text-sm font-medium whitespace-nowrap">
              {t('nav.home')}
            </Link>
            <Link href="/host/dashboard" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-gray-100 text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
              {t('nav.host')}
            </Link>
            <Link href="/club" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-gray-100 text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
              {t('nav.club')}
            </Link>
            <Link href="/settings" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-gray-100 text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
              {t('nav.settings')}
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </nav>

          {/* Search Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white shadow-sm border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>
            <Button
              className="rounded-full w-10 h-10 bg-black text-white hover:bg-gray-800 shrink-0 shadow-lg hover:shadow-xl transition-all"
              onClick={() => { }}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Main Feed */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">

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
                      className="min-w-[280px] sm:min-w-[320px] lg:min-w-[22%] snap-start shrink-0 bg-white rounded-2xl sm:rounded-[20px] overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer group/card flex flex-col"
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
                        <h4 className="font-bold text-sm truncate mb-1 group-hover/card:text-emerald-600 transition-colors">{event.title}</h4>

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

            {/* Recently Viewed Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[32px] p-4 sm:p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <History className="w-4 h-4" />
                <h3 className="text-xs font-bold tracking-wider uppercase">{t('home.sidebar.recentlyViewed')}</h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-2 sm:gap-3 group cursor-pointer">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gray-100 bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${mockEvents[i].image})` }} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm truncate group-hover:text-emerald-600 transition-colors">{mockEvents[i].title}</h4>
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{mockEvents[i].date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Actions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[32px] p-4 sm:p-6 text-white shadow-lg"
            >
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">快速操作</h3>
              <div className="space-y-2 sm:space-y-3">
                <Link href="/host/edit">
                  <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-left transition-all text-xs sm:text-sm font-medium">
                    辦個自己的活動
                  </button>
                </Link>
                <Link href="/settings">
                  <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-left transition-all text-xs sm:text-sm font-medium">
                    成為貢獻者
                  </button>
                </Link>
                <Link href="/club">
                  <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-left transition-all text-xs sm:text-sm font-medium">
                    成為社群領袖
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Map Preview Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              onClick={() => setIsMapOpen(true)}
              className="bg-white rounded-[24px] sm:rounded-[32px] p-2 border border-gray-100 shadow-sm h-[250px] sm:h-[300px] relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-2 rounded-[16px] sm:rounded-[24px] overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://docs.mapbox.com/mapbox-gl-js/assets/streets-v11.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-80" />
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
            <div className="bg-black text-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold mb-2">{t('home.sidebar.yourVibe')}</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">You've joined 3 events this month.</p>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center p-2 sm:p-3 bg-white/10 rounded-xl text-xs sm:text-sm">
                  <span>🔥 Hot Tags</span>
                  <span className="font-bold">Tech, Party</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <Logo />
              <p className="mt-4 text-gray-500 max-w-xs">
                {t('footer.tagline')} <br />
                {t('footer.madeIn')}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('footer.discover')}</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-black">{t('footer.featured')}</a></li>
                <li><a href="#" className="hover:text-black">{t('footer.trending')}</a></li>
                <li><a href="#" className="hover:text-black">{t('footer.newArrivals')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('footer.community')}</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-black">{t('footer.guidelines')}</a></li>
                <li><a href="#" className="hover:text-black">{t('footer.support')}</a></li>
                <li><a href="#" className="hover:text-black">{t('footer.partner')}</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 text-xs text-gray-400">
            <div className="text-center md:text-left">
              <p>{t('footer.copyright')}</p>
              <p className="mt-1 text-gray-300">{t('footer.techSupport')}</p>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-black">{t('footer.privacy')}</a>
              <a href="#" className="hover:text-black">{t('footer.terms')}</a>
              <a href="#" className="hover:text-black">{t('footer.cookies')}</a>
            </div>
          </div>
        </div>
      </footer>

      {showOnboarding && (
        <div onClick={() => setShowOnboarding(false)}>
          <OnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} />
        </div>
      )}
    </main>
  );
}
