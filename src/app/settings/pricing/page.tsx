'use client';

import { Button } from '@/components/ui/button';
import { Check, X, Sparkles, Users, Briefcase, Crown } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TIERS = [
    {
        id: 'free',
        name: 'Free',
        price: 'NT$0',
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
        id: 'plus',
        name: 'Plus',
        price: 'NT$299',
        period: '/月',
        description: '適合活躍主辦方與專業 Vendor',
        features: [
            { name: 'Free 全部功能', included: true },
            { name: '創建 5 場活動', included: true },
            { name: '活動人數上限 500 人', included: true },
            { name: '進階票務功能', included: true },
            { name: '合作招募功能', included: true },
            { name: '完整數據報表', included: true },
            { name: 'Vendor 經營功能', included: true },
            { name: '優先推薦曝光', included: true },
            { name: '專業 Vendor 徽章', included: true },
        ],
        cta: '升級 Plus',
        ctaDisabled: false,
        popular: true,
    },
];

const VENDOR_BENEFITS = [
    {
        icon: Briefcase,
        title: '專業形象展示',
        description: '建立完整 Vendor 檔案，展示過往作品和服務項目，讓主辦方一眼認識你',
    },
    {
        icon: Users,
        title: '更多合作機會',
        description: '當主辦方發起合作需求時，Plus 會員優先出現在推薦名單中',
    },
    {
        icon: Sparkles,
        title: '累積口碑評價',
        description: '每次合作都能累積評價和案例，建立長期信任，複利式成長',
    },
    {
        icon: Crown,
        title: '專業徽章認證',
        description: '獲得 "Verified Vendor" 徽章，提升專業度和可信度',
    },
];

export default function PricingPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">會員方案</h1>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl space-y-12">
                {/* Hero */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">選擇適合你的方案</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        無論你是想探索活動、主辦派對，還是成為專業 Vendor，我們都有適合你的方案
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {TIERS.map((tier) => (
                        <div
                            key={tier.id}
                            className={`relative bg-white rounded-2xl p-6 border-2 ${tier.popular ? 'border-black' : 'border-gray-100'
                                }`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-black text-white text-xs px-3 py-1 rounded-full">
                                        推薦
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold">{tier.name}</h3>
                                <div className="mt-2">
                                    <span className="text-4xl font-bold">{tier.price}</span>
                                    <span className="text-gray-500">{tier.period}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">{tier.description}</p>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {tier.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        {feature.included ? (
                                            <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        ) : (
                                            <X className="w-5 h-5 text-gray-300 shrink-0" />
                                        )}
                                        <span className={feature.included ? '' : 'text-gray-400'}>
                                            {feature.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full h-12 rounded-xl ${tier.popular
                                        ? 'bg-black text-white hover:bg-gray-800'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}
                                disabled={tier.ctaDisabled}
                            >
                                {tier.cta}
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Vendor/Supplier Benefits */}
                <section className="bg-white rounded-2xl p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold mb-2">Vendor & Supplier 專屬優勢</h3>
                        <p className="text-gray-500">
                            成為 Plus 會員，解鎖專業經營功能，讓你的服務被更多主辦方看見
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {VENDOR_BENEFITS.map((benefit, idx) => {
                            const Icon = benefit.icon;
                            return (
                                <div key={idx} className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                        <Icon className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">{benefit.title}</h4>
                                        <p className="text-sm text-gray-500">{benefit.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 text-center">
                            💡 <strong>成長飛輪</strong>：參與活動 → 建立口碑 → 獲得推薦 → 更多合作機會 → 累積更多評價
                        </p>
                    </div>
                </section>

                {/* FAQ */}
                <section>
                    <h3 className="text-xl font-bold mb-4">常見問題</h3>
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <h4 className="font-medium mb-2">什麼時候需要升級？</h4>
                            <p className="text-sm text-gray-500">
                                當你想創建超過 1 場活動、需要進階票務功能、或想成為專業 Vendor 經營服務時，Plus 會員能滿足你的需求。
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <h4 className="font-medium mb-2">Vendor 和 Supplier 有什麼區別？</h4>
                            <p className="text-sm text-gray-500">
                                Vendor 是提供專業服務的人（如攝影師、DJ、調酒師），Supplier 是提供資源的單位（如場地、贊助、設備）。兩者都能在平台上展示服務、接受合作邀約。
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <h4 className="font-medium mb-2">付款方式？</h4>
                            <p className="text-sm text-gray-500">
                                目前支援信用卡付款，未來將開放更多支付方式。訂閱後可隨時取消，取消後仍可使用至期滿。
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center">
                    <Link href="/settings">
                        <Button variant="outline" className="rounded-xl">
                            返回會員中心
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
