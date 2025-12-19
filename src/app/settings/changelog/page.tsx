"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function ChangelogPage() {
    const router = useRouter();

    const logs = [
        {
            version: "2.0.0",
            date: "2024-12-20",
            title: "票夾與導航重構 + 合規頁面",
            features: [
                "全新導航結構：首頁-活動-票夾-社群-我的",
                "票夾頁面 (/wallet)：管理所有票券、4 種狀態分類",
                "票券詳情 Modal：QR Code、簽到碼、轉送入口",
                "內嵌兌換功能：支援 URL 參數自動填入",
                "分享通路追蹤：自定義 1-3 個推廣渠道",
                "活動管理新增「推廣追蹤」分頁",
                "法律頁面雙語化：服務條款/隱私政策/免責聲明",
                "新增金流服務聲明頁面 (/payment-terms)",
            ],
            type: "major"
        },
        {
            version: "1.1.0",
            date: "2024-12-16",
            title: "12/16 更新",
            features: [
                "品牌更新：標語改為「城市活動行事曆」",
                "首頁 Tag 可複選篩選",
                "活動卡片顯示距離 Tag",
                "Admin 活動發布頁面（自定義主辦方、社媒連結）",
                "活動編輯新增外部連結欄位",
                "會員頁面顯示用戶資訊和頭像",
            ],
            type: "major"
        },
        {
            version: "1.0.0",
            date: "2024-12-14",
            title: "Quick Registration",
            features: [
                "一鍵報名功能",
                "EventDetailClient / EventDetailModal 整合",
                "RegistrationModal 改用 Server Action",
            ],
            type: "major"
        },
        {
            version: "0.9.5",
            date: "2024-12-01",
            title: "MVP 基礎功能",
            features: [
                "活動 CRUD 與報名流程",
                "Host Dashboard 管理後台",
                "Weekly Calendar 週曆檢視",
                "地圖預覽功能",
                "中英文切換",
            ],
            type: "minor"
        }
    ];

    return (
        <main className="min-h-screen bg-gray-50 text-black pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">功能更新日誌</h1>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold">What's New</h2>
                    <p className="text-gray-500">最新功能與改進。</p>
                </div>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {logs.map((log, index) => (
                        <div key={index} className="relative flex items-start group is-active">
                            <div className="absolute left-0 ml-5 -translate-x-1/2 mt-1.5 w-4 h-4 rounded-full border-2 border-white bg-gray-200 group-[.is-active]:bg-emerald-500 group-[.is-active]:shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" />

                            <div className="ml-12 w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={log.type === 'major' ? 'default' : 'secondary'} className="rounded-full">
                                            v{log.version}
                                        </Badge>
                                        <span className="text-sm text-gray-400 font-mono">{log.date}</span>
                                    </div>
                                    {index === 0 && (
                                        <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                            <Sparkles className="w-3 h-3 mr-1" /> Latest
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold mb-4">{log.title}</h3>

                                <ul className="space-y-3">
                                    {log.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
