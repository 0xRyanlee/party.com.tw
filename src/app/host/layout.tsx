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
        { key: 'dashboard', href: '/host/dashboard', icon: LayoutDashboard, label: '儀表板' },
        { key: 'edit', href: '/host/edit', icon: Edit, label: '編輯詳情' },
        { key: 'manage', href: '/host/manage', icon: Users, label: '活動管理' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            {/* Host Header - 單行緊湊佈局 */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="container mx-auto px-4 h-14 flex items-center gap-3">
                    {/* 返回按鈕 */}
                    <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="-ml-2 shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    {/* H Icon */}
                    <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold shrink-0">
                        H
                    </div>

                    {/* Tabs - 直接在 H icon 旁邊 */}
                    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            const Icon = tab.icon;
                            return (
                                <Link
                                    key={tab.key}
                                    href={tab.href}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all
                                        ${isActive
                                            ? 'bg-black text-white font-bold'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 max-w-6xl pb-24">
                {children}
            </main>
        </div>
    );
}

