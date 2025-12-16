'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';
import { mockEvents, tags } from '@/lib/mock-data';
import CategoryFilter from '@/components/CategoryFilter';
import PullToRefresh from '@/components/PullToRefresh';

export default function DiscoverPage() {
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleToggleTag = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 下拉刷新處理
  const handleRefresh = useCallback(async () => {
    // 模擬網絡請求延遲
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 觸發重新渲染
    setRefreshKey(prev => prev + 1);
    console.log('頁面已刷新');
  }, []);

  const filteredEvents = mockEvents.filter(event => {
    // Filter by status
    if (event.status !== 'active') return false;

    // Filter by tags if any selected
    if (activeTags.length > 0 && !event.tags.some(tag => activeTags.includes(tag))) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-gray-50 pb-24">
      <div className="pt-6 md:pt-8 container mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="mb-6 space-y-4 px-4 sm:px-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">探索活動</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋活動、地點..."
              className="w-full h-11 md:h-12 bg-white border border-gray-200 rounded-xl pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 text-sm md:text-base"
            />
          </div>
        </div>

        {/* Category Filter - Using shared component */}
        <div className="mb-4 md:mb-6">
          <CategoryFilter
            tags={tags}
            activeTags={activeTags}
            onToggleTag={handleToggleTag}
          />
        </div>

        {/* Events Grid */}
        <div className="px-4 sm:px-0">
          <div key={refreshKey} className="grid gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <EventCard event={event} />
              </Link>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">找不到符合條件的活動</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setActiveTags([]);
                  setSearchQuery('');
                }}
                className="mt-4"
              >
                清除篩選條件
              </Button>
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}

