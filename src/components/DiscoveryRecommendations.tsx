'use client';

import { useBrowsingHistory } from '@/hooks/useBrowsingHistory';
import { mockEvents } from '@/lib/mock-data';
import EventCard from './EventCard';
import { motion } from 'framer-motion';
import { History, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

interface RecommendationSectionProps {
    type: 'browsing' | 'guess';
    title: string;
    icon: React.ReactNode;
}

export function RecommendationSection({ type, title, icon }: RecommendationSectionProps) {
    const { history, getTopTags } = useBrowsingHistory();
    const { t } = useLanguage();

    let eventsToShow: any[] = [];

    if (type === 'browsing') {
        // Find mock events matching history IDs to get full details
        eventsToShow = history
            .map(h => mockEvents.find(e => e.id === h.id))
            .filter((e): e is any => !!e);
    } else {
        const topTags = getTopTags(3);
        if (topTags.length > 0) {
            // Filter events that match any of the top tags, excluding those already in history
            const historyIds = new Set(history.map(h => h.id));
            eventsToShow = mockEvents
                .filter(e => !historyIds.has(e.id) && e.tags.some(tag => topTags.includes(tag)))
                .slice(0, 6);
        }

        // Fallback to trending/recent if no tags or not enough events
        if (eventsToShow.length < 3) {
            const historyIds = new Set(history.map(h => h.id));
            const extra = mockEvents
                .filter(e => !historyIds.has(e.id) && !eventsToShow.find(ex => ex.id === e.id))
                .slice(0, 6 - eventsToShow.length);
            eventsToShow = [...eventsToShow, ...extra];
        }
    }

    if (eventsToShow.length === 0) return null;

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-neutral-100 rounded-full">
                        {icon}
                    </div>
                    <h2 className="text-xl font-black tracking-tight">{title}</h2>
                </div>
                {type === 'guess' && (
                    <Link href="/discover" className="text-sm font-bold flex items-center gap-1 hover:underline">
                        探索更多 <ChevronRight className="w-4 h-4" />
                    </Link>
                )}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {eventsToShow.map((event, index) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex-shrink-0 w-[280px] sm:w-[320px]"
                    >
                        <EventCard event={event} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

export default function DiscoveryRecommendations() {
    return (
        <div className="space-y-4">
            <RecommendationSection
                type="guess"
                title="猜你喜歡"
                icon={<Sparkles className="w-5 h-5 text-purple-600" />}
            />
            <RecommendationSection
                type="browsing"
                title="上次瀏覽"
                icon={<History className="w-5 h-5 text-neutral-600" />}
            />
        </div>
    );
}
