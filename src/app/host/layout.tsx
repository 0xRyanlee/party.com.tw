"use client";

import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Edit, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function HostLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();

    const tabs = [
        { key: 'dashboard', href: '/host/dashboard', icon: LayoutDashboard, label: t('host.nav.dashboard') },
        { key: 'edit', href: '/host/edit', icon: Edit, label: t('host.nav.edit') },
        { key: 'manage', href: '/host/manage', icon: Users, label: t('host.nav.manage') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            {/* Host Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="-ml-2">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold">H</div>
                            <span className="font-bold text-lg hidden sm:inline">Host Center</span>
                        </div>
                    </div>
                </div>

                {/* Sub Navigation */}
                <div className="container mx-auto px-4">
                    <nav className="flex gap-6 overflow-x-auto scrollbar-hide -mb-px">
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            const Icon = tab.icon;
                            return (
                                <Link
                                    key={tab.key}
                                    href={tab.href}
                                    className={`
                    flex items-center gap-2 pb-3 pt-1 border-b-2 transition-all whitespace-nowrap
                    ${isActive
                                            ? 'border-black text-black font-bold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm">{tab.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {children}
            </main>
        </div>
    );
}
