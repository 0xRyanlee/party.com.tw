'use client';

import { useState, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import FloatingActionButton from '@/components/FloatingActionButton';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Event } from '@/lib/mock-data';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EventsClientProps {
    initialEvents: Event[];
}

export default function EventsClient({ initialEvents }: EventsClientProps) {
    const [activeFilter, setActiveFilter] = useState('全部');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEvents = useMemo(() => {
        return initialEvents.filter(event => {
            const matchesFilter = activeFilter === '全部' ||
                event.type === activeFilter ||
                event.tags.includes(activeFilter);
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [initialEvents, activeFilter, searchQuery]);

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
                    {filteredEvents.length > 0 ? (
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
