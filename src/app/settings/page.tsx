"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, FileText, Briefcase, Users, Bell, Shield, LogOut, ArrowLeft, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const { user, loading } = useUser();
    const { requireAuth } = useAuth();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest User';
    const avatarUrl = user?.user_metadata?.avatar_url;
    const email = user?.email;

    return (
        <main className="min-h-screen bg-gray-50 text-black pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">{t('settings.title')}</h1>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">

                {/* Account Section */}
                <section>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">{t('settings.account')}</h2>
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <div className="p-4 flex items-center gap-4 border-b border-gray-50">
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={avatarUrl} alt={displayName} />
                                <AvatarFallback className="bg-gray-200 text-gray-600 text-xl">
                                    {displayName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{loading ? '載入中...' : displayName}</h3>
                                <p className="text-sm text-gray-500">
                                    {user ? email : t('settings.signInDesc')}
                                </p>
                            </div>
                        </div>
                        <Link href="/settings/notifications" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-gray-400" />
                                <span className="font-medium">{t('settings.notifications')}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                        <Link href="/privacy" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-gray-400" />
                                <span className="font-medium">{t('settings.privacy')}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                        <Link href="/settings/language" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="w-5 h-5 text-gray-400 text-center text-sm">A</span>
                                <span className="font-medium">Language</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">繁體中文</span>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Membership Tier */}
                <section>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">會員方案</h2>
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <Link href="/settings/pricing" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="font-bold block">會員方案</span>
                                    <span className="text-xs text-gray-400">查看 Free / Plus 方案權益</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                    </div>
                </section>

                {/* Community & Business */}
                <section>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">{t('settings.communityBusiness')}</h2>
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-50">
                        <Link href="/host/edit" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:scale-110 transition-transform">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="font-bold block">{t('settings.becomeLead')}</span>
                                    <span className="text-xs text-gray-400">{t('settings.becomeLeadDesc')}</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                        <Link href="/club" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:scale-110 transition-transform">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="font-bold block">Club Management</span>
                                    <span className="text-xs text-gray-400">Create or manage your clubs</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                        <Link href="/settings/report" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="font-bold block">Report & Feedback</span>
                                    <span className="text-xs text-gray-400">Report issues, suggest features</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                        <Link href="/settings/vendor" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="font-bold block">Become Vendor / Supplier</span>
                                    <span className="text-xs text-gray-400">Offer services or resources</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                    </div>
                </section>

                {/* PWA Install Section - Mobile Only */}
                <section className="md:hidden">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">快速存取</h2>
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <button
                            onClick={() => {
                                localStorage.removeItem('pwa-prompt-dismissed');
                                alert('請在 3 秒後查看底部彈窗');
                            }}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center">
                                    <span className="text-white text-xs">+</span>
                                </div>
                                <div className="text-left">
                                    <span className="font-bold block">加入主畫面</span>
                                    <span className="text-xs text-gray-400">像 App 一樣使用 Party</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </button>
                    </div>
                </section>

                {/* Legal & Info */}
                <section>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">{t('settings.info')}</h2>
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-50">
                        <Link href="/terms" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-600" />
                                <span>服務條款</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>
                        <Link href="/contact" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-gray-400" />
                                <span className="font-medium">{t('settings.feedback')}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                        <Link href="/settings/changelog" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-gray-400" />
                                <span className="font-medium">{t('settings.changelog')}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                        <div className="p-4 text-center">
                            <p className="text-xs text-gray-300">版本 1.0.0 (Build 20241216)</p>
                        </div>
                    </div>
                </section>

                {user && (
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full rounded-xl h-12 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> {t('settings.logout')}
                    </Button>
                )}

            </div>


        </main>
    );
}
