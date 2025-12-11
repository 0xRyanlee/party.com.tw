'use client';

import { useState } from 'react';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';
import { mockEvents } from '@/lib/mock-data';

export default function DiscoverPage() {
  const [activeFilter, setActiveFilter] = useState('全部');

  return (
    <main className="min-h-screen bg-white text-gray-900 pb-24">
      <div className="pt-8 px-6 container mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold">探索活動</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜尋活動、地點..."
              className="w-full h-12 bg-gray-50 border border-gray-200 rounded-md pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <Button
            variant="outline"
            size="icon"
            className="rounded-md w-10 h-10 shrink-0 border-gray-200 bg-white hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
          {['全部', '小聚', '小會', '小活動', '小快閃'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all
                ${activeFilter === filter
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </main>
  );
}

