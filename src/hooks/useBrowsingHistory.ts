'use client';

import { useState, useEffect } from 'react';

export interface HistoryItem {
    id: string;
    title: string;
    image: string;
    date: string;
    location: string;
    tags?: string[];
    viewedAt: number;
}

const STORAGE_KEY = 'party_browsing_history';
const MAX_HISTORY = 10;

const PREFERENCE_KEY = 'party_tag_preferences';

export function useBrowsingHistory() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [preferences, setPreferences] = useState<Record<string, number>>({});

    useEffect(() => {
        const storedHistory = localStorage.getItem(STORAGE_KEY);
        if (storedHistory) {
            try {
                setHistory(JSON.parse(storedHistory));
            } catch (e) {
                console.error('Failed to parse history', e);
            }
        }

        const storedPrefs = localStorage.getItem(PREFERENCE_KEY);
        if (storedPrefs) {
            try {
                setPreferences(JSON.parse(storedPrefs));
            } catch (e) {
                console.error('Failed to parse preferences', e);
            }
        }
    }, []);

    const addToHistory = (item: Omit<HistoryItem, 'viewedAt'>) => {
        const now = Date.now();
        const newItem = { ...item, viewedAt: now };

        // 1. Update History
        setHistory(prev => {
            const filtered = prev.filter(h => h.id !== item.id);
            const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });

        // 2. Update Preferences (Tags)
        if (item.tags && item.tags.length > 0) {
            setPreferences(prev => {
                const updated = { ...prev };
                item.tags?.forEach(tag => {
                    updated[tag] = (updated[tag] || 0) + 1;
                });
                localStorage.setItem(PREFERENCE_KEY, JSON.stringify(updated));
                return updated;
            });
        }
    };

    const getTopTags = (limit = 3) => {
        return Object.entries(preferences)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([tag]) => tag);
    };

    const clearHistory = () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PREFERENCE_KEY);
        setHistory([]);
        setPreferences({});
    };

    return { history, preferences, addToHistory, getTopTags, clearHistory };
}
