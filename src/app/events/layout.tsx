"use client";

import { useLanguage } from "@/lib/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Calendar, Plus } from "lucide-react";

export default function EventsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useLanguage();
    const pathname = usePathname();

    const tabs = [
        {
            key: 'discover',
            href: '/events',
            icon: Compass,
            label: '探索',
            matchPaths: ['/events', '/events/discover']
        },
        {
            key: 'schedule',
            href: '/events/schedule',
            icon: Calendar,
            label: '行程時間線',
            matchPaths: ['/events/schedule']
        },
        {
            key: 'host',
            href: '/events/host',
            icon: Plus,
            label: '發起活動',
            matchPaths: ['/events/host']
        },
    ];

    const isActive = (tab: typeof tabs[0]) => {
        if (tab.key === 'discover') {
            // Discover is active for /events and /events/discover, but not for /events/schedule or /events/host
            return pathname === '/events' ||
                pathname === '/events/discover' ||
                pathname.startsWith('/events/') &&
                !pathname.startsWith('/events/schedule') &&
                !pathname.startsWith('/events/host');
        }
        return tab.matchPaths.some(p => pathname.startsWith(p));
    };

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            {/* Sub Navigation */}
            <div className="sticky top-16 z-10 bg-white border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <nav className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
                        {tabs.map((tab) => {
                            const active = isActive(tab);
                            const Icon = tab.icon;
                            return (
                                <Link
                                    key={tab.key}
                                    href={tab.href}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap
                                        ${active
                                            ? 'bg-black text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{tab.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            <main>
                {children}
            </main>
        </div>
    );
}
