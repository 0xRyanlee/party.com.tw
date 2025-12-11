"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, FileText, Briefcase, Users, Settings as SettingsIcon, Bell, Shield, LogOut, ArrowLeft, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

export default function SettingsPage() {
    const router = useRouter();
    const { t } = useLanguage();

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
                            <div className="w-16 h-16 bg-gray-200 rounded-full" />
                            <div>
                                <h3 className="font-bold text-lg">Guest User</h3>
                                <p className="text-sm text-gray-500">{t('settings.signInDesc')}</p>
                            </div>
                            <Button className="ml-auto rounded-full bg-black text-white hover:bg-gray-800">
                                {t('settings.signIn')}
                            </Button>
                        </div>
                        <Link href="#" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-gray-400" />
                                <span className="font-medium">{t('settings.notifications')}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                        <Link href="#" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-gray-400" />
                                <span className="font-medium">{t('settings.privacy')}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                    </div>
                </section>

                {/* Community & Business */}
                <section>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">{t('settings.communityBusiness')}</h2>
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-50">
                        <Link href="/community/lead" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="font-bold block">{t('settings.becomeLead')}</span>
                                    <span className="text-xs text-gray-400">{t('settings.becomeLeadDesc')}</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
                        <Link href="/business" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-gray-400" />
                                <span className="font-medium">{t('settings.businessCoop')}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </Link>
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
                        <Link href="#" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
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
                            <p className="text-xs text-gray-300">{t('settings.version')} 1.0.0 (Build 20231124)</p>
                        </div>
                    </div>
                </section>

                <Button variant="outline" className="w-full rounded-xl h-12 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                    <LogOut className="w-4 h-4 mr-2" /> {t('settings.logout')}
                </Button>

            </div>
        </main>
    );
}
