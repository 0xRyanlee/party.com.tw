"use client";

import { useState } from 'react';
import { Event, mockEvents } from '@/lib/mock-data';
import { MapPin } from 'lucide-react';
import EventDetailModal from './EventDetailModal';

export default function WeeklyCalendar() {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    // Sort events by date/time
    const sortedEvents = [...mockEvents].sort((a, b) => {
        const dateA = new Date(`${a.fullDate}T${a.time}`);
        const dateB = new Date(`${b.fullDate}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
    });

    return (
        <section className="py-2">
            <h2 className="text-sm font-bold text-gray-500 mb-3 tracking-wider uppercase">This week</h2>

            <div className="space-y-1">
                {sortedEvents.map((event) => {
                    const dayNumber = event.fullDate.split('-')[2];
                    return (
                        <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="group flex items-start gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100"
                        >
                            {/* Date & Time Column */}
                            <div className="w-14 shrink-0 flex flex-col items-end pt-0.5">
                                <div className="text-xs font-bold text-black uppercase tracking-tight leading-none mb-1">
                                    {event.dayOfWeek} <span className="text-gray-400">{dayNumber}</span>
                                </div>
                                <div className="text-[10px] font-medium text-gray-400 font-mono">
                                    {event.time}
                                </div>
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 min-w-0 border-l-2 border-gray-100 pl-3 group-hover:border-emerald-500 transition-colors py-0.5">
                                <div className="flex items-baseline justify-between gap-2 mb-1">
                                    <h4 className="font-bold text-sm truncate group-hover:text-emerald-700 transition-colors leading-none">
                                        {event.title}
                                    </h4>
                                    {/* Location - Hidden on very small screens */}
                                    <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate max-w-[80px]">{event.location.split(',')[0]}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {event.tags.slice(0, 2).map(tag => (
                                        <span
                                            key={tag}
                                            className="border border-gray-200 rounded-full px-1.5 py-[1px] text-[9px] font-medium tracking-widest uppercase text-gray-400 group-hover:border-gray-300 group-hover:text-gray-500 transition-colors"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <EventDetailModal
                event={selectedEvent}
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
            />
        </section>
    );
}
