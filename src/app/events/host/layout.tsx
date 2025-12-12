"use client";

import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Edit, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function EventsHostLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();

    const tabs = [
        { key: 'dashboard', href: '/events/host/dashboard', icon: LayoutDashboard, label: '儀表板' },
        { key: 'edit', href: '/events/host/edit', icon: Edit, label: '建立活動' },
        { key: 'manage', href: '/events/host/manage', icon: Users, label: '活動管理' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            {/* Host Sub-Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm">H</div>
                            <span className="font-semibold">主辦中心</span>
                        </div>
                    </div>

                    {/* Host Sub Navigation */}
                    <nav className="flex gap-1 overflow-x-auto scrollbar-hide pb-3 -mb-px">
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
                            const Icon = tab.icon;
                            return (
                                <Link
                                    key={tab.key}
                                    href={tab.href}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap text-sm
                                        ${isActive
                                            ? 'bg-gray-100 text-black font-medium'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {children}
            </main>
        </div>
    );
}
