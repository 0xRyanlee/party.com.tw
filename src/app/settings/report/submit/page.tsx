"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Loader2, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

type ReportConfig = {
    title: string;
    categories: { value: string; label: string }[];
    placeholder: string;
    contactLabel: string;
};

const CONFIGS: Record<string, ReportConfig> = {
    report: {
        title: '違規檢舉',
        categories: [
            { value: 'harassment', label: '騷擾或霸凌' },
            { value: 'sexual', label: '色情或裸露內容' },
            { value: 'violence', label: '暴力或仇恨言論' },
            { value: 'scam', label: '詐騙或垃圾訊息' },
            { value: 'political', label: '政治敏感議題' },
            { value: 'other', label: '其他違規行為' }
        ],
        placeholder: '請詳細描述違規情況，例如：發生時間、相關連結或截圖說明...',
        contactLabel: '聯絡信箱（選填，僅用於未登入時聯繫）'
    },
    feedback: {
        title: '平台反饋',
        categories: [
            { value: 'bug', label: '功能異常 (Bug)' },
            { value: 'feature_request', label: '功能缺失 / 許願' },
            { value: 'ux_issue', label: '介面體驗建議' },
            { value: 'content_error', label: '內容錯誤回報' },
            { value: 'other', label: '其他建議' }
        ],
        placeholder: '請告訴我們發生了什麼問題，或是您希望有哪些新功能...',
        contactLabel: '聯絡信箱（選填，方便我們回報處理進度）'
    },
    collaboration: {
        title: '合作共創',
        categories: [
            { value: 'business', label: '商業合作洽談' },
            { value: 'co_event', label: '活動共創提案' },
            { value: 'supplier', label: '申請成為供應商/場地方' },
            { value: 'media', label: '媒體採訪需求' },
            { value: 'other', label: '其他合作' }
        ],
        placeholder: '請簡述您的合作構想、預計形式以及聯絡需求...',
        contactLabel: '您的聯絡信箱（必填）'
    }
};

function SubmitForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const typeParam = searchParams.get('type') || 'report';
    // Ensure type is valid key
    const type = (typeParam in CONFIGS ? typeParam : 'report') as keyof typeof CONFIGS;
    const config = CONFIGS[type];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [category, setCategory] = useState("");
    const [content, setContent] = useState("");
    const [contact, setContact] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!category) {
            toast({
                title: "請選擇分類",
                variant: "destructive"
            });
            return;
        }

        if (content.length < 10) {
            toast({
                title: "內容太短",
                description: "請至少輸入 10 個字以上的描述",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // TODO: Replace with actual API call
            // await fetch('/api/reports', { ... })

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success feedback
            toast({
                title: "提交成功",
                description: "我們已收到您的訊息，將盡快處理。",
            });

            // Redirect back to settings
            setTimeout(() => {
                router.push('/settings');
            }, 1000);

        } catch (error) {
            console.error(error);
            toast({
                title: "提交失敗",
                description: "發生未知錯誤，請稍後再試",
                variant: "destructive"
            });
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <header className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">{config.title}</h1>
            </header>

            <form onSubmit={handleSubmit} className="container mx-auto px-4 py-8 max-w-2xl space-y-8">

                {/* Category Selection */}
                <div className="space-y-2">
                    <Label className="text-base font-semibold">問題分類 <span className="text-red-500">*</span></Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-12 rounded-xl bg-white border-gray-200">
                            <SelectValue placeholder="請選擇分類" />
                        </SelectTrigger>
                        <SelectContent>
                            {config.categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Content Textarea */}
                <div className="space-y-2">
                    <Label className="text-base font-semibold">詳細描述 <span className="text-red-500">*</span></Label>
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={config.placeholder}
                        className="min-h-[200px] resize-none rounded-xl bg-white border-gray-200 p-4 text-base leading-relaxed"
                    />
                </div>

                {/* File Upload (Visual only for now) */}
                <div className="space-y-2">
                    <Label className="text-base font-semibold">上傳圖片/截圖 (選填)</Label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-sm">點擊上傳或拖曳檔案至此</span>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                    <Label className="text-base font-semibold">{config.contactLabel}</Label>
                    <Input
                        type="email"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="example@email.com"
                        className="h-12 rounded-xl bg-white border-gray-200"
                    />
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-full bg-black text-white hover:bg-gray-800 text-base font-medium transition-all shadow-md active:scale-[0.99]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            提交中...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            提交表單
                        </>
                    )}
                </Button>

            </form>
        </>
    );
}

export default function ReportSubmitPage() {
    return (
        <main className="min-h-screen bg-gray-50 text-black pb-20">
            <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
                <SubmitForm />
            </Suspense>
        </main>
    );
}
