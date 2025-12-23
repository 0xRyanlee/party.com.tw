"use client";

import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { LayoutDashboard, Edit, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import AuthModal from "@/components/AuthModal";
import { useState, useEffect } from "react";

export default function HostLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useUser();
    const [showAuthModal, setShowAuthModal] = useState(false);

    // 未登入時顯示登入提示
    useEffect(() => {
        if (!loading && !user) {
            setShowAuthModal(true);
        }
    }, [user, loading]);

    const tabs = [
        { key: 'dashboard', href: '/host/dashboard', icon: LayoutDashboard, label: '儀表板' },
        { key: 'edit', href: '/host/edit', icon: Edit, label: '編輯詳情' },
        { key: 'manage', href: '/host/manage', icon: Users, label: '活動管理' },
    ];

    // 顯示載入中
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">載入中...</div>
            </div>
        );
    }

    // 未登入時顯示登入提示
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 text-black">
                <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
                    <div className="container mx-auto px-4 h-14 flex items-center gap-3">
                        <Link href="/">
                            <Logo />
                        </Link>
                    </div>
                </header>
                <main className="container mx-auto px-4 py-12 max-w-md text-center">
                    <h1 className="text-2xl font-bold mb-4">請先登入</h1>
                    <p className="text-gray-600 mb-6">
                        建立活動需要登入帳號，請先登入後再繼續。
                    </p>
                    <Button
                        onClick={() => setShowAuthModal(true)}
                        className="rounded-full px-6"
                    >
                        立即登入
                    </Button>
                </main>
                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => {
                        setShowAuthModal(false);
                        if (!user) router.push('/');
                    }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            {/* Host Header - 單行緊湊佈局 */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="container mx-auto px-4 h-14 flex items-center gap-3">
                    {/* Logo */}
                    <Link href="/" className="shrink-0 mr-2">
                        <Logo />
                    </Link>

                    {/* 返回按鈕 */}
                    <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="-ml-2 shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    {/* Tabs - 直接在返回按鈕旁邊 */}
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
