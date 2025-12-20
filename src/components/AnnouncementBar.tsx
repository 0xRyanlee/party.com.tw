'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Info, AlertTriangle, AlertCircle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Announcement {
    id: string;
    title: string;
    content: string | null;
    type: 'info' | 'warning' | 'alert';
    is_active: boolean;
    created_at: string;
}

const TYPE_CONFIG = {
    info: {
        icon: Info,
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        iconColor: 'text-blue-500',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        iconColor: 'text-amber-500',
    },
    alert: {
        icon: AlertCircle,
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        iconColor: 'text-red-500',
    },
};

export default function AnnouncementBar() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const supabase = createClient();

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const { data } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) {
                // Filter out dismissed ones from localStorage
                const storedDismissed = localStorage.getItem('dismissed_announcements');
                const dismissedSet: Set<string> = storedDismissed ? new Set(JSON.parse(storedDismissed) as string[]) : new Set();
                setDismissed(dismissedSet);
                setAnnouncements(data.filter((a: Announcement) => !dismissedSet.has(a.id)));
            }
        };

        fetchAnnouncements();
    }, [supabase]);

    // Auto-rotate announcements
    useEffect(() => {
        if (announcements.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % announcements.length);
        }, 8000);

        return () => clearInterval(timer);
    }, [announcements.length]);

    const handleDismiss = (id: string) => {
        const newDismissed = new Set(dismissed);
        newDismissed.add(id);
        setDismissed(newDismissed);
        localStorage.setItem('dismissed_announcements', JSON.stringify([...newDismissed]));
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setCurrentIndex(0);
    };

    if (announcements.length === 0) return null;

    const current = announcements[currentIndex];
    if (!current) return null;

    const config = TYPE_CONFIG[current.type] || TYPE_CONFIG.info;
    const Icon = config.icon;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={current.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`${config.bg} ${config.border} border-b`}
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-2 gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Icon className={`w-4 h-4 ${config.iconColor} shrink-0`} />
                            <div className="flex-1 min-w-0">
                                <span className={`text-sm font-medium ${config.text}`}>
                                    {current.title}
                                </span>
                                {current.content && (
                                    <span className={`text-sm ${config.text} opacity-80 ml-2`}>
                                        — {current.content}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {announcements.length > 1 && (
                                <div className="flex gap-1">
                                    {announcements.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex
                                                ? config.iconColor.replace('text-', 'bg-')
                                                : 'bg-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={() => handleDismiss(current.id)}
                                className={`p-1 rounded-full hover:bg-white/50 transition-colors ${config.text}`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
