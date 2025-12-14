'use client';

import { useState, useMemo } from 'react';

import FloatingActionButton from '@/components/FloatingActionButton';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Event } from '@/lib/mock-data';
import { Search, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EventsClientProps {
    initialEvents: Event[];
}

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

export default function EventsClient({ initialEvents }: EventsClientProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('全部');
    const [priceFilter, setPriceFilter] = useState('全部');
    const [customTagInput, setCustomTagInput] = useState('');

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
            // Tag filter (多選：只要符合任一個即可)
            const matchesFilter = selectedTags.length === 0 ||
                selectedTags.some(tag =>
                    event.type === tag ||
                    event.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
                );

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
    }, [initialEvents, selectedTags, searchQuery, dateFilter, priceFilter]);

    const clearAllFilters = () => {
        setSelectedTags([]);
        setSearchQuery('');
        setDateFilter('全部');
        setPriceFilter('全部');
    };

    const hasActiveFilters = selectedTags.length > 0 || searchQuery || dateFilter !== '全部' || priceFilter !== '全部';

    return (
        <>

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
                    <div className="space-y-4 mb-8">
                        {/* Type Filters - 改為 Tag 多選 */}
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
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTags.includes(tag.value)
                                            ? 'bg-black text-white'
                                            : 'bg-white border border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {tag.label}
                                    </button>
                                ))}

                                {/* 自定義 Tag 輸入 */}
                                <div className="flex items-center gap-1">
                                    <Input
                                        value={customTagInput}
                                        onChange={(e) => setCustomTagInput(e.target.value)}
                                        onKeyPress={handleCustomTagKeyPress}
                                        placeholder="自定義..."
                                        className="w-28 h-9 text-sm rounded-full border-dashed"
                                    />
                                    {customTagInput && (
                                        <button
                                            onClick={addCustomTag}
                                            className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* 已選的自定義標籤 */}
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
                                            className={`rounded-full whitespace-nowrap ${dateFilter === filter ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white'}`}
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
                                            className={`rounded-full whitespace-nowrap ${priceFilter === filter ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white'}`}
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
                            <Search className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">找不到符合條件的活動</h3>
                            <p className="text-gray-500 mb-6">
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
                </div>
            </div>
        </>
    );
}

