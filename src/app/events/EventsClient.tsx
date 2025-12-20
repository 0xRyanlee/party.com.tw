'use client';

import { useState, useMemo, useEffect } from 'react';
import FloatingActionButton from '@/components/FloatingActionButton';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Event } from '@/lib/mock-data';
import { Search, X, Plus, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface EventsClientProps {
    initialEvents: Event[];
}

type TabType = 'explore' | 'my-events';

// Default event type tags (English only)
const DEFAULT_TYPE_TAGS = [
    { value: 'sport', label: 'Sport & Fitness' },
    { value: 'bar', label: 'Bar & Nightclub' },
    { value: 'cafe', label: 'Cafe & Coffee' },
    { value: 'meetup', label: 'Meetup & Social' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'conference', label: 'Conference' },
    { value: 'networking', label: 'Networking' },
    { value: 'music', label: 'Music & Concert' },
];

interface MyEventItem {
    id: string;
    event_id: string;
    status: string;
    checked_in: boolean;
    event?: {
        id: string;
        title: string;
        start_time: string;
        venue_name?: string;
        cover_image?: string;
    };
}

type SortOrder = 'upcoming' | 'latest' | 'popular';

export default function EventsClient({ initialEvents }: EventsClientProps) {
    const [activeTab, setActiveTab] = useState<TabType>('explore');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('全部');
    const [priceFilter, setPriceFilter] = useState('全部');
    const [customTagInput, setCustomTagInput] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('upcoming');

    // My Events state
    const [myEvents, setMyEvents] = useState<MyEventItem[]>([]);
    const [isLoadingMyEvents, setIsLoadingMyEvents] = useState(false);

    useEffect(() => {
        if (activeTab === 'my-events') {
            fetchMyEvents();
        }
    }, [activeTab]);

    const fetchMyEvents = async () => {
        setIsLoadingMyEvents(true);
        try {
            const res = await fetch('/api/user/registrations');
            if (res.ok) {
                const data = await res.json();
                setMyEvents(data.registrations || []);
            } else {
                setMyEvents([]);
            }
        } catch (error) {
            console.error('Error fetching my events:', error);
            setMyEvents([]);
        } finally {
            setIsLoadingMyEvents(false);
        }
    };

    const toggleTag = (tagValue: string) => {
        setSelectedTags(prev =>
            prev.includes(tagValue)
                ? prev.filter(t => t !== tagValue)
                : [...prev, tagValue]
        );
    };

    const addCustomTag = () => {
        const trimmed = customTagInput.trim().toLowerCase();
        if (trimmed && !selectedTags.includes(trimmed)) {
            setSelectedTags(prev => [...prev, trimmed]);
            setCustomTagInput('');
        }
    };

    const handleCustomTagKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomTag();
        }
    };

    const filteredEvents = useMemo(() => {
        return initialEvents.filter(event => {
            const matchesFilter = selectedTags.length === 0 ||
                selectedTags.some(tag =>
                    event.type === tag ||
                    event.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
                );

            const matchesSearch = !searchQuery ||
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

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
    }, [initialEvents, selectedTags, searchQuery, dateFilter, priceFilter]);

    // Sort filtered events
    const sortedEvents = useMemo(() => {
        const events = [...filteredEvents];
        switch (sortOrder) {
            case 'upcoming':
                return events.sort((a, b) => {
                    const dateA = new Date(a.fullDate + ' ' + a.time);
                    const dateB = new Date(b.fullDate + ' ' + b.time);
                    return dateA.getTime() - dateB.getTime();
                });
            case 'latest':
                // Sort by id (assuming newer events have higher ids) or use fullDate as proxy
                return events.sort((a, b) => b.id.localeCompare(a.id));
            case 'popular':
                // Sort by engagement (attendees/capacity ratio, or just capacity as proxy)
                return events.sort((a, b) => (b.attendees || 0) - (a.attendees || 0));
            default:
                return events;
        }
    }, [filteredEvents, sortOrder]);

    const clearAllFilters = () => {
        setSelectedTags([]);
        setSearchQuery('');
        setDateFilter('全部');
        setPriceFilter('全部');
    };

    const hasActiveFilters = selectedTags.length > 0 || searchQuery || dateFilter !== '全部' || priceFilter !== '全部';

    // Group my events by date for timeline
    const groupedMyEvents = useMemo(() => {
        const groups: { [key: string]: MyEventItem[] } = {};
        myEvents.forEach(item => {
            if (item.event?.start_time) {
                const date = new Date(item.event.start_time).toLocaleDateString('zh-TW', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                });
                if (!groups[date]) groups[date] = [];
                groups[date].push(item);
            }
        });
        return groups;
    }, [myEvents]);

    return (
        <>
            <FloatingActionButton />

            <div className="min-h-screen bg-background pt-16 pb-24">
                <div className="container mx-auto px-4 md:px-6">
                    {/* Tab Navigation */}
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-full max-w-xs mb-2">
                        <button
                            onClick={() => setActiveTab('explore')}
                            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${activeTab === 'explore'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            探索
                        </button>
                        <button
                            onClick={() => setActiveTab('my-events')}
                            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${activeTab === 'my-events'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            活動管理
                        </button>
                    </div>

                    {activeTab === 'explore' ? (
                        <>
                            {/* Explore Tab Content */}
                            <div className="mb-4 space-y-3">
                                <div>
                                    <h1 className="text-2xl font-bold text-text-primary mb-0.5">探索活動</h1>
                                    <p className="text-sm text-text-secondary">發現身邊的精彩聚會</p>
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
                            <div className="space-y-3 mb-4">
                                {/* Type Filters */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-700">活動類型</h3>
                                        {selectedTags.length > 0 && (
                                            <button
                                                onClick={() => setSelectedTags([])}
                                                className="text-xs text-gray-400 hover:text-gray-600"
                                            >
                                                清除 ({selectedTags.length})
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {DEFAULT_TYPE_TAGS.map((tag) => (
                                            <button
                                                key={tag.value}
                                                onClick={() => toggleTag(tag.value)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTags.includes(tag.value)
                                                    ? 'bg-black text-white'
                                                    : 'bg-white border border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {tag.label}
                                            </button>
                                        ))}

                                        {/* Custom Tag Input */}
                                        <div className="flex items-center gap-1">
                                            <Input
                                                value={customTagInput}
                                                onChange={(e) => setCustomTagInput(e.target.value)}
                                                onKeyPress={handleCustomTagKeyPress}
                                                placeholder="自定義..."
                                                className="w-24 h-8 text-sm rounded-full border-dashed"
                                            />
                                            {customTagInput && (
                                                <button
                                                    onClick={addCustomTag}
                                                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Selected custom tags */}
                                    {selectedTags.filter(t => !DEFAULT_TYPE_TAGS.some(d => d.value === t)).length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedTags
                                                .filter(t => !DEFAULT_TYPE_TAGS.some(d => d.value === t))
                                                .map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-100 rounded-full text-sm"
                                                    >
                                                        {tag}
                                                        <button onClick={() => toggleTag(tag)}>
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>

                                {/* Date & Price Filters */}
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">日期</h3>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {['全部', '今天', '本週', '本月'].map((filter) => (
                                                <Button
                                                    key={filter}
                                                    variant={dateFilter === filter ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setDateFilter(filter)}
                                                    className={`rounded-full whitespace-nowrap ${dateFilter === filter ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white'}`}
                                                >
                                                    {filter}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">價格</h3>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {['全部', '免費', '付費'].map((filter) => (
                                                <Button
                                                    key={filter}
                                                    variant={priceFilter === filter ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setPriceFilter(filter)}
                                                    className={`rounded-full whitespace-nowrap ${priceFilter === filter ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white'}`}
                                                >
                                                    {filter}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sort Order */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">排序</h3>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {[
                                                { value: 'upcoming', label: '即將開始' },
                                                { value: 'latest', label: '最新發布' },
                                                { value: 'popular', label: '最熱門' },
                                            ].map((option) => (
                                                <Button
                                                    key={option.value}
                                                    variant={sortOrder === option.value ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setSortOrder(option.value as SortOrder)}
                                                    className={`rounded-full whitespace-nowrap ${sortOrder === option.value ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white'}`}
                                                >
                                                    {option.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Events Grid */}
                            {sortedEvents.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sortedEvents.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <Search className="w-10 h-10 text-gray-400 mb-4 mx-auto" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">找不到符合條件的活動</h3>
                                    <p className="text-gray-500 mb-4 text-sm">
                                        {searchQuery
                                            ? `沒有符合「${searchQuery}」的活動`
                                            : '沒有符合篩選條件的活動'}
                                    </p>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="outline"
                                            onClick={clearAllFilters}
                                            className="rounded-full"
                                        >
                                            清除所有篩選
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* My Events Tab Content */}
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-text-primary mb-1">活動管理</h1>
                                <p className="text-sm text-text-secondary">您已報名的活動時間線</p>
                            </div>

                            {isLoadingMyEvents ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                </div>
                            ) : myEvents.length > 0 ? (
                                <div className="space-y-6">
                                    {Object.entries(groupedMyEvents).map(([date, events]) => (
                                        <div key={date}>
                                            <h3 className="text-sm font-medium text-gray-500 mb-3 sticky top-16 bg-background py-2">
                                                {date}
                                            </h3>
                                            <div className="space-y-3">
                                                {events.map((item) => (
                                                    <Link
                                                        key={item.id}
                                                        href={`/events/${item.event_id}`}
                                                        className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="flex gap-4">
                                                            {item.event?.cover_image && (
                                                                <img
                                                                    src={item.event.cover_image}
                                                                    alt={item.event?.title}
                                                                    className="w-20 h-20 rounded-xl object-cover"
                                                                />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-gray-900 truncate">
                                                                    {item.event?.title || '活動'}
                                                                </h4>
                                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span>
                                                                        {item.event?.start_time
                                                                            ? new Date(item.event.start_time).toLocaleTimeString('zh-TW', {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })
                                                                            : '時間未定'}
                                                                    </span>
                                                                </div>
                                                                {item.event?.venue_name && (
                                                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                                        <MapPin className="w-4 h-4" />
                                                                        <span className="truncate">{item.event.venue_name}</span>
                                                                    </div>
                                                                )}
                                                                <div className="mt-2">
                                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${item.checked_in
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : item.status === 'confirmed'
                                                                            ? 'bg-neutral-100 text-neutral-700'
                                                                            : 'bg-yellow-100 text-yellow-700'
                                                                        }`}>
                                                                        {item.checked_in ? '已簽到' : item.status === 'confirmed' ? '已確認' : '待確認'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <Calendar className="w-10 h-10 text-gray-400 mb-4 mx-auto" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">尚無報名活動</h3>
                                    <p className="text-gray-500 mb-4 text-sm">
                                        去探索頁面找些有趣的活動吧！
                                    </p>
                                    <Button
                                        onClick={() => setActiveTab('explore')}
                                        className="rounded-full"
                                    >
                                        探索活動
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
