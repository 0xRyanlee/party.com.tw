"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-2 text-gray-500 hover:text-black"
            onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
        >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium uppercase">{locale === 'en' ? 'EN' : '繁中'}</span>
        </Button>
    );
}
