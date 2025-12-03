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
    const [dateFilter, setDateFilter] = useState('全部');
    const [priceFilter, setPriceFilter] = useState('全部');

    const filteredEvents = useMemo(() => {
        return initialEvents.filter(event => {
            // Type filter
            const matchesFilter = activeFilter === '全部' ||
                event.type === activeFilter ||
                event.tags.includes(activeFilter);

            // Search filter
            const matchesSearch = !searchQuery ||
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            // Date filter
            let matchesDate = true;
            if (dateFilter !== '全部') {
                const eventDate = new Date(event.fullDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (dateFilter === '今天') {
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    matchesDate = eventDate >= today && eventDate < tomorrow;
                } else if (dateFilter === '本週') {
                    const weekEnd = new Date(today);
                    weekEnd.setDate(weekEnd.getDate() + 7);
                    matchesDate = eventDate >= today && eventDate < weekEnd;
                } else if (dateFilter === '本月') {
                    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    matchesDate = eventDate >= today && eventDate <= monthEnd;
                }
            }

            // Price filter
            let matchesPrice = true;
            if (priceFilter !== '全部') {
                if (priceFilter === '免費') {
                    matchesPrice = event.price === 'Free' || event.price === '$0';
                } else if (priceFilter === '付費') {
                    matchesPrice = event.price !== 'Free' && event.price !== '$0';
                }
            }

            return matchesFilter && matchesSearch && matchesDate && matchesPrice;
        });
    }, [initialEvents, activeFilter, searchQuery, dateFilter, priceFilter]);

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
                                placeholder="搜尋活動、地點或標籤..."
                                className="pl-10 rounded-full bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                    {filteredEvents.length} 個結果
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="space-y-3 mb-8">
                        {/* Type Filters */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">活動類型</h3>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {filters.map((filter) => (
                                    <Button
                                        key={filter}
                                        variant={activeFilter === filter ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setActiveFilter(filter)}
                                        className={`rounded-full capitalize whitespace-nowrap ${activeFilter === filter ? 'bg-black text-white hover:bg-gray-800' : 'bg-white'}`}
                                    >
                                        {filter === '全部' ? '全部' : filter}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Date & Price Filters */}
                        <div className="grid md:grid-cols-2 gap-3">
                            {/* Date Filter */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">日期</h3>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {['全部', '今天', '本週', '本月'].map((filter) => (
                                        <Button
                                            key={filter}
                                            variant={dateFilter === filter ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setDateFilter(filter)}
                                            className={`rounded-full whitespace-nowrap ${dateFilter === filter ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-white'}`}
                                        >
                                            {filter}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">價格</h3>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {['全部', '免費', '付費'].map((filter) => (
                                        <Button
                                            key={filter}
                                            variant={priceFilter === filter ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPriceFilter(filter)}
                                            className={`rounded-full whitespace-nowrap ${priceFilter === filter ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white'}`}
                                        >
                                            {filter}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Events Grid */}
                    {filteredEvents.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">找不到符合條件的活動</h3>
                            <p className="text-gray-500 mb-6">
                                {searchQuery
                                    ? `沒有符合「${searchQuery}」的活動`
                                    : '沒有符合篩選條件的活動'}
                            </p>
                            {(searchQuery || activeFilter !== '全部' || dateFilter !== '全部' || priceFilter !== '全部') && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setActiveFilter('全部');
                                        setDateFilter('全部');
                                        setPriceFilter('全部');
                                    }}
                                    className="rounded-full"
                                >
                                    清除所有篩選
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
