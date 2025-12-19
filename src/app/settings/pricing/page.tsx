'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Sparkles, Users, Briefcase, Crown, Clock } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Countdown target date: 2026/3/1
const PROMO_END_DATE = new Date('2026-03-01T00:00:00');

function useCountdown(targetDate: Date) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
}

const TIERS = [
    {
        id: 'free',
        name: 'Free',
        price: 'NT$0',
        originalPrice: null,
        period: '永久免費',
        description: '適合剛開始探索的個人用戶',
        features: [
            { name: '瀏覽所有公開活動', included: true },
            { name: '報名免費活動', included: true },
            { name: '基礎個人檔案', included: true },
            { name: '創建 1 場活動', included: true },
            { name: '活動人數上限 50 人', included: true },
            { name: '進階票務功能', included: false },
            { name: '合作招募功能', included: false },
            { name: '完整數據報表', included: false },
            { name: 'Vendor 經營功能', included: false },
        ],
        cta: '目前方案',
        ctaDisabled: true,
        popular: false,
    },
    {
        id: 'plus-monthly',
        name: 'Plus 月付',
        price: 'NT$66',
        originalPrice: 'NT$99',
        period: '/月',
        description: '限時早鳥優惠',
        features: [
            { name: 'Free 全部功能', included: true },
            { name: '創建無限場活動', included: true },
            { name: '活動人數上限 500 人', included: true },
            { name: '進階票務功能', included: true },
            { name: '合作招募功能', included: true },
            { name: '完整數據報表', included: true },
            { name: 'Vendor 經營功能', included: true },
            { name: '優先推薦曝光', included: true },
            { name: '專業 Vendor 徽章', included: true },
        ],
        cta: '立即訂閱',
        ctaDisabled: false,
        popular: false,
    },
    {
        id: 'plus-quarterly',
        name: 'Plus 季付',
        price: 'NT$188',
        originalPrice: 'NT$297',
        period: '/季',
        savings: '省 NT$109',
        description: '最划算的選擇',
        features: [
            { name: 'Free 全部功能', included: true },
            { name: '創建無限場活動', included: true },
            { name: '活動人數上限 500 人', included: true },
            { name: '進階票務功能', included: true },
            { name: '合作招募功能', included: true },
            { name: '完整數據報表', included: true },
            { name: 'Vendor 經營功能', included: true },
            { name: '優先推薦曝光', included: true },
            { name: '專業 Vendor 徽章', included: true },
        ],
        cta: '立即訂閱',
        ctaDisabled: false,
        popular: true,
    },
];

const VENDOR_BENEFITS = [
    {
        icon: Briefcase,
        title: '專業形象展示',
        description: '建立完整 Vendor 檔案，展示過往作品和服務項目',
    },
    {
        icon: Users,
        title: '更多合作機會',
        description: 'Plus 會員優先出現在主辦方推薦名單中',
    },
    {
        icon: Sparkles,
        title: '累積口碑評價',
        description: '每次合作都能累積評價和案例，建立長期信任',
    },
    {
        icon: Crown,
        title: '專業徽章認證',
        description: '獲得 Verified Vendor 徽章，提升專業度',
    },
];

export default function PricingPage() {
    const router = useRouter();
    const countdown = useCountdown(PROMO_END_DATE);

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">會員方案</h1>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
                {/* Hero */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">限時早鳥優惠</h2>
                    <p className="text-gray-500 max-w-xl mx-auto mb-6">
                        現在訂閱享超值優惠，錯過不再
                    </p>

                    {/* Countdown Timer */}
                    <div className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full">
                        <Clock className="w-5 h-5" />
                        <span className="text-sm font-medium">優惠倒計時</span>
                        <div className="flex gap-1 ml-2">
                            <span className="bg-white/20 px-2 py-1 rounded text-sm font-mono">
                                {String(countdown.days).padStart(2, '0')}天
                            </span>
                            <span className="bg-white/20 px-2 py-1 rounded text-sm font-mono">
                                {String(countdown.hours).padStart(2, '0')}時
                            </span>
                            <span className="bg-white/20 px-2 py-1 rounded text-sm font-mono">
                                {String(countdown.minutes).padStart(2, '0')}分
                            </span>
                            <span className="bg-white/20 px-2 py-1 rounded text-sm font-mono">
                                {String(countdown.seconds).padStart(2, '0')}秒
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                    {TIERS.map((tier) => (
                        <div
                            key={tier.id}
                            className={`relative bg-white rounded-2xl p-6 border-2 ${tier.popular ? 'border-black' : 'border-gray-100'
                                }`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-black text-white text-xs px-3 py-1 rounded-full">
                                        最划算
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold">{tier.name}</h3>
                                <div className="mt-2">
                                    {tier.originalPrice && (
                                        <span className="text-gray-400 line-through text-sm mr-2">
                                            {tier.originalPrice}
                                        </span>
                                    )}
                                    <span className="text-3xl font-bold">{tier.price}</span>
                                    <span className="text-gray-500">{tier.period}</span>
                                </div>
                                {tier.savings && (
                                    <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        {tier.savings}
                                    </span>
                                )}
                                <p className="text-sm text-gray-500 mt-2">{tier.description}</p>
                            </div>

                            <ul className="space-y-2 mb-6 text-sm">
                                {tier.features.slice(0, 5).map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        {feature.included ? (
                                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                                        ) : (
                                            <X className="w-4 h-4 text-gray-300 shrink-0" />
                                        )}
                                        <span className={feature.included ? '' : 'text-gray-400'}>
                                            {feature.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full h-12 rounded-full ${tier.popular
                                    ? 'bg-black text-white hover:bg-gray-800'
                                    : tier.ctaDisabled
                                        ? 'bg-gray-100 text-gray-500'
                                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
                                    }`}
                                disabled={tier.ctaDisabled}
                            >
                                {tier.cta}
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Plus Features Highlight */}
                <div className="bg-neutral-900 text-white rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-2 text-center">Plus 會員專屬功能</h3>
                    <p className="text-white/60 text-sm text-center mb-6">
                        每天不到 NT$3，解鎖全套專業工具
                    </p>

                    {/* Hero Features */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[
                            { title: '智能簽到工具', desc: 'QR Code 掃碼、自動驗證、即時統計', tag: '熱門' },
                            { title: '專業人才匹配', desc: '快速找到攝影師、DJ、主持人等專業人員', tag: '新功能' },
                            { title: '快速拼團合作', desc: '一鍵發起合作邀請，多方協調無障礙', tag: null },
                            { title: '成本試算驗證', desc: '活動成本/收入預估，降低決策風險', tag: null },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/10 rounded-xl p-4 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <Check className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium">{item.title}</h4>
                                        {item.tag && (
                                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                                                {item.tag}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-white/60">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Data & Reports */}
                    <div className="border-t border-white/10 pt-6 mb-6">
                        <h4 className="font-medium mb-4 text-center">數據與報表</h4>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {[
                                '30 天報名追蹤',
                                'PDF 報告',
                                '轉化漏斗',
                                '收入分析',
                                '歷史對比',
                                'CSV 匯出',
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white/5 rounded-lg p-2 text-center">
                                    <Check className="w-4 h-4 mx-auto mb-1 text-green-400" />
                                    <span className="text-xs">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pro Tools */}
                    <div className="border-t border-white/10 pt-6">
                        <h4 className="font-medium mb-4 text-center">專業經營工具</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                            {[
                                { title: 'Portfolio 展示', desc: '過往項目作品集，建立專業形象' },
                                { title: '傾向性標籤', desc: '自動生成服務標籤，被精準推薦' },
                                { title: '客戶再行銷', desc: '參與者名單管理，提升複購率' },
                                { title: 'Verified 徽章', desc: '專業認證標誌，建立信任' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                                    <span>{item.title}</span>
                                    <span className="text-white/40">- {item.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Vendor/Supplier Benefits */}
                <section className="bg-white rounded-2xl p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <h3 className="text-xl font-bold mb-2">Vendor 專屬優勢</h3>
                        <p className="text-gray-500 text-sm">
                            成為 Plus 會員，解鎖專業經營功能
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {VENDOR_BENEFITS.map((benefit, idx) => {
                            const Icon = benefit.icon;
                            return (
                                <div key={idx} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                        <Icon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">{benefit.title}</h4>
                                        <p className="text-sm text-gray-500">{benefit.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* FAQ */}
                <section>
                    <h3 className="text-lg font-bold mb-4">常見問題</h3>
                    <div className="space-y-3">
                        {[
                            { q: '什麼時候需要升級？', a: '當你想創建超過 1 場活動、需要進階票務功能、或想成為專業 Vendor 時' },
                            { q: '早鳥優惠會持續多久？', a: '優惠將於 2026 年 3 月 1 日結束，之後恢復原價' },
                            { q: '可以隨時取消嗎？', a: '可以隨時取消訂閱，取消後仍可使用至期滿' },
                        ].map((faq, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-100">
                                <h4 className="font-medium mb-1">{faq.q}</h4>
                                <p className="text-sm text-gray-500">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center">
                    <Link href="/settings">
                        <Button variant="outline" className="rounded-full">
                            返回會員中心
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
