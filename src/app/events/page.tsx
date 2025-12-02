'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import FloatingActionButton from '@/components/FloatingActionButton';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Event } from '@/lib/mock-data';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'published')
          .order('start_time', { ascending: true });

        if (error) throw error;

        if (data) {
          const mappedEvents: Event[] = data.map((dbEvent: any) => {
            const startDate = new Date(dbEvent.start_time);
            const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const dayOfWeek = startDate.toLocaleDateString('en-US', { weekday: 'short' });
            const timeStr = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

            // Calculate price display
            let priceDisplay = 'Free';
            if (dbEvent.ticket_types && dbEvent.ticket_types.length > 0) {
              const prices = dbEvent.ticket_types.map((t: any) => Number(t.price));
              const minPrice = Math.min(...prices);
              priceDisplay = minPrice === 0 ? 'Free' : `$${minPrice}`;
            }

            return {
              id: dbEvent.id,
              title: dbEvent.title,
              type: dbEvent.category || 'event',
              format: 'indoor', // Default or derive from DB if available
              attributes: dbEvent.tags || [],
              date: dateStr,
              fullDate: dbEvent.start_time.split('T')[0],
              dayOfWeek: dayOfWeek,
              time: timeStr,
              location: dbEvent.venue_name || dbEvent.address || 'TBD',
              lat: dbEvent.gps_lat || 25.0330,
              lng: dbEvent.gps_lng || 121.5654,
              distance: 0, // Calculate if user location is available
              attendees: dbEvent.registered_count || 0,
              capacity: dbEvent.capacity_total || 100,
              image: dbEvent.cover_image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2940&auto=format&fit=crop',
              tags: dbEvent.tags || [],
              description: dbEvent.description_short || '',
              price: priceDisplay,
              organizer: {
                id: dbEvent.organizer_id || 'unknown', // organizer_id might not be in the select * if not joined, but let's assume it is or use name
                name: dbEvent.organizer_name || 'Organizer',
                avatar: dbEvent.organizer_avatar,
                role: 'member',
                verified: dbEvent.organizer_verified
              },
              isPromoted: false
            };
          });
          setEvents(mappedEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesFilter = activeFilter === '全部' ||
        event.type === activeFilter ||
        event.tags.includes(activeFilter);
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [events, activeFilter, searchQuery]);

  const filters = ['全部', 'party', 'meetup', 'workshop', 'gathering', 'lecture'];

  return (
    <>
      <Navigation />
      <FloatingActionButton />

      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="mb-8 space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">探索活動</h1>
              <p className="text-text-secondary">發現身邊的精彩聚會</p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜尋活動或地點..."
                className="pl-10 rounded-full bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full capitalize ${activeFilter === filter ? 'bg-black text-white hover:bg-gray-800' : 'bg-white'}`}
              >
                {filter === '全部' ? '全部' : filter}
              </Button>
            ))}
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p>沒有找到符合條件的活動</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
