'use client';

import { useState } from 'react';
import { X, Navigation, MapPin, Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/lib/mock-data';
import { useLanguage } from '@/lib/i18n';

interface MapModalProps {
    isOpen: boolean;
    onClose: () => void;
    events: Event[];
    center?: { lat: number; lng: number };
}

export default function MapModal({ isOpen, onClose, events, center = { lat: 25.0330, lng: 121.5654 } }: MapModalProps) {
    const { t } = useLanguage();
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    // Mock coordinates for demo (in real app, events should have lat/lng)
    const eventsWithCoords = events.map((event, idx) => ({
        ...event,
        lat: center.lat + (Math.random() - 0.5) * 0.05,
        lng: center.lng + (Math.random() - 0.5) * 0.05,
    }));

    const handleNavigate = (event: Event & { lat: number; lng: number }) => {
        // Deep link to Google Maps
        const url = `https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`;
        window.open(url, '_blank');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">附近活動地圖</h2>
                                <p className="text-sm text-gray-500 mt-1">點擊標記查看活動詳情</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="rounded-full hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Map Container */}
                        <div className="flex-1 relative">
                            {/* Placeholder Map (replace with Google Maps in production) */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-sm">Google Maps 將在此處顯示</p>
                                    <p className="text-gray-400 text-xs mt-2">需要 Google Maps API Key</p>
                                </div>
                            </div>

                            {/* Event Markers (absolute positioned for demo) */}
                            {eventsWithCoords.slice(0, 5).map((event, idx) => (
                                <motion.button
                                    key={event.id}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => setSelectedEvent(event)}
                                    className="absolute w-10 h-10 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white font-bold hover:scale-110 transition-transform cursor-pointer border-4 border-white"
                                    style={{
                                        left: `${20 + idx * 15}%`,
                                        top: `${30 + (idx % 2) * 20}%`,
                                    }}
                                >
                                    {idx + 1}
                                </motion.button>
                            ))}
                        </div>

                        {/* Event Detail Card (Stage 2) */}
                        <AnimatePresence>
                            {selectedEvent && (
                                <motion.div
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                    className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 max-h-[50vh] overflow-y-auto"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Event Image */}
                                        <div
                                            className="w-24 h-24 rounded-2xl bg-cover bg-center flex-shrink-0"
                                            style={{ backgroundImage: `url(${selectedEvent.image})` }}
                                        />

                                        {/* Event Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                                                    {selectedEvent.title}
                                                </h3>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedEvent(null)}
                                                    className="flex-shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Badges */}
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <Badge variant="secondary" className="text-xs">
                                                    {t(`types.${selectedEvent.type}` as any)}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {t(`formats.${selectedEvent.format}` as any)}
                                                </Badge>
                                            </div>

                                            {/* Details */}
                                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>{selectedEvent.date} · {selectedEvent.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span>{selectedEvent.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span>{selectedEvent.attendees} / {selectedEvent.capacity} 人參加</span>
                                                </div>
                                            </div>

                                            {/* Navigate Button */}
                                            <Button
                                                onClick={() => handleNavigate(selectedEvent as any)}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                <Navigation className="w-4 h-4 mr-2" />
                                                在 Google Maps 中導航
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
