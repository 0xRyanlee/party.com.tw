"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";

export default function ChangelogPage() {
    const router = useRouter();
    const { t } = useLanguage();

    const logs = [
        {
            version: "1.0.0",
            date: "2023-11-24",
            title: "Initial Release",
            features: [
                "Launched Party Aggregator MVP",
                "Event discovery and search",
                "Host dashboard for event management",
                "Localization support (EN/ZH)",
                "User settings and profile management"
            ],
            type: "major"
        },
        {
            version: "0.9.5",
            date: "2023-11-20",
            title: "Beta Testing",
            features: [
                "Implemented Weekly Calendar",
                "Added 'Recently Viewed' widget",
                "Optimized mobile responsiveness",
                "Integrated Mapbox preview"
            ],
            type: "minor"
        }
    ];

    return (
        <main className="min-h-screen bg-gray-50 text-black pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">Changelog</h1>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold">What's New</h2>
                    <p className="text-gray-500">Stay updated with the latest features and improvements.</p>
                </div>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {logs.map((log, index) => (
                        <div key={index} className="relative flex items-start group is-active">
                            <div className="absolute left-0 ml-5 -translate-x-1/2 mt-1.5 w-4 h-4 rounded-full border-2 border-white bg-gray-200 group-[.is-active]:bg-emerald-500 group-[.is-active]:shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" />

                            <div className="ml-12 w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={log.type === 'major' ? 'default' : 'secondary'} className="rounded-full">
                                            v{log.version}
                                        </Badge>
                                        <span className="text-sm text-gray-400 font-mono">{log.date}</span>
                                    </div>
                                    {index === 0 && (
                                        <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                            <Sparkles className="w-3 h-3 mr-1" /> Latest
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold mb-4">{log.title}</h3>

                                <ul className="space-y-3">
                                    {log.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
