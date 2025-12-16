"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

const languages = [
    { code: 'auto', label: 'Auto (Follow System)', labelZh: '自動（跟隨系統）' },
    { code: 'zh', label: 'Traditional Chinese', labelZh: '繁體中文' },
    { code: 'en', label: 'English', labelZh: 'English' },
];

export default function LanguageSettingsPage() {
    const router = useRouter();
    const { locale, setLocale } = useLanguage();
    const [selectedLang, setSelectedLang] = useState<string>(locale);

    // Detect system language on mount
    useEffect(() => {
        const savedLang = localStorage.getItem('app-language');
        if (savedLang === 'auto' || !savedLang) {
            // Follow system language
            const systemLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
            setLocale(systemLang);
            setSelectedLang('auto');
        } else {
            setSelectedLang(savedLang);
        }
    }, [setLocale]);

    const handleSelectLanguage = (code: string) => {
        setSelectedLang(code);
        localStorage.setItem('app-language', code);

        if (code === 'auto') {
            const systemLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
            setLocale(systemLang);
        } else {
            setLocale(code as 'zh' | 'en');
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 text-black pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">Language Options</h1>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
                <p className="text-sm text-gray-500 px-2">
                    Choose your preferred language for the app interface.
                </p>

                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelectLanguage(lang.code)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                        >
                            <div>
                                <span className="font-medium block">{lang.label}</span>
                                {lang.label !== lang.labelZh && (
                                    <span className="text-sm text-gray-400">{lang.labelZh}</span>
                                )}
                            </div>
                            {selectedLang === lang.code && (
                                <Check className="w-5 h-5 text-black" />
                            )}
                        </button>
                    ))}
                </div>

                <p className="text-xs text-gray-400 px-2">
                    When set to &quot;Auto&quot;, the app will follow your device&apos;s system language setting.
                </p>
            </div>
        </main>
    );
}
