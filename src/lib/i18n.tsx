"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dictionary, Locale } from './dictionaries';

type I18nContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>('zh');

    // Persist language preference
    useEffect(() => {
        const saved = localStorage.getItem('locale') as Locale;
        if (saved && (saved === 'en' || saved === 'zh')) {
            setLocale(saved);
        }
    }, []);

    const handleSetLocale = (newLocale: Locale) => {
        setLocale(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    // Helper to get nested object value by string path (e.g., "home.title")
    const t = (path: string) => {
        const keys = path.split('.');
        let current: any = dictionary[locale];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation missing for key: ${path}`);
                return path;
            }
            current = current[key];
        }

        return current as string;
    };

    return (
        <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within an I18nProvider');
    }
    return context;
}
