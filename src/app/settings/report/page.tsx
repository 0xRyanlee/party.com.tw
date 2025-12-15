"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircleWarning, Lightbulb, Handshake, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function ReportCenterPage() {
    const router = useRouter();

    const reportTypes = [
        {
            id: 'report',
            title: '違規檢舉',
            description: '舉報騷擾、色情、暴力、詐騙或其他違規內容',
            icon: MessageCircleWarning,
            color: 'bg-red-100 text-red-600',
            path: '/settings/report/submit?type=report'
        },
        {
            id: 'feedback',
            title: '平台反饋',
            description: '回報功能錯誤 (Bug)、功能缺失或是體驗建議',
            icon: Lightbulb,
            color: 'bg-yellow-100 text-yellow-600',
            path: '/settings/report/submit?type=feedback'
        },
        {
            id: 'collaboration',
            title: '合作共創',
            description: '商業合作洽談、活動共創提案或供應商申請',
            icon: Handshake,
            color: 'bg-purple-100 text-purple-600',
            path: '/settings/report/submit?type=collaboration'
        }
    ];

    return (
        <main className="min-h-screen bg-gray-50 text-black pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">申訴與回報中心</h1>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">我們能為您做什麼？</h2>
                    <p className="text-gray-500">請選擇您要進行的回報類型，協助我們建立更好的社群環境。</p>
                </div>

                <div className="grid gap-4">
                    {reportTypes.map((item) => (
                        <Card
                            key={item.id}
                            onClick={() => router.push(item.path)}
                            className="p-6 cursor-pointer hover:shadow-md transition-all border-gray-100 active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 text-center text-xs text-gray-400">
                    <p>提交的內容將由專人審核，我們會在 1-3 個工作天內回覆您。</p>
                </div>
            </div>
        </main>
    );
}
