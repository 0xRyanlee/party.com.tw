'use client';

import { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';
import { mockEvents } from '@/lib/mock-data';

export default function DiscoverPage() {
  const [activeFilter, setActiveFilter] = useState('全部');

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      <HomeHeader />

      <div className="pt-24 px-6 container mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold">探索活動</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="搜尋活動、地點..."
              className="w-full h-12 bg-[#1C1C1E] rounded-full pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06C755]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 shrink-0 border-white/20 bg-transparent hover:bg-white/10"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
          {['全部', '小聚', '小會', '小活動', '小快閃'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`
                px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${activeFilter === filter
                  ? 'bg-[#06C755] text-white'
                  : 'bg-[#1C1C1E] text-gray-400 hover:text-white hover:bg-[#2C2C2E]'
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {mockEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </main>
  );
}
