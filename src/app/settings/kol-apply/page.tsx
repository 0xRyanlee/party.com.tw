"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles, Check, Instagram, Youtube, Twitter, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = [
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'youtube', label: 'YouTube', icon: Youtube },
    { id: 'tiktok', label: 'TikTok', icon: Twitter },
    { id: 'facebook', label: 'Facebook', icon: Twitter },
    { id: 'other', label: '其他', icon: Twitter },
];

const CATEGORIES = [
    '科技', '生活', '美食', '旅遊', '運動健身',
    '時尚', '教育', '商業', '娛樂', '藝術',
];

export default function KOLApplyPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        profession: '',
        company: '',
        platform: '',
        account: '',
        followers: '',
        category: '',
        intention: '',
        reason: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.profession || !form.platform || !form.account || !form.followers || !form.category) {
            toast.error('請填寫所有必填欄位');
            return;
        }

        setIsSubmitting(true);

        // TODO: Submit to API
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success('申請已提交！我們將在 3 個工作日內回覆您');
        router.push('/settings');
    };

    return (
        <main className="min-h-screen bg-zinc-50 pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-zinc-100 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">KOL 身份驗證</h1>
            </header>

            <div className="container mx-auto px-4 py-6 max-w-xl">
                {/* Hero */}
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-6 text-white mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl">成為認證 KOL</h2>
                            <p className="text-pink-100 text-sm">獲得專屬權益與曝光機會</p>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>免費獲得 Plus 會員試用 30 天</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>專屬活動推薦與邀請</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>優先體驗新功能</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 職業/名片 */}
                    <div className="space-y-2">
                        <Label htmlFor="profession">職業 / 身份 *</Label>
                        <Input
                            id="profession"
                            value={form.profession}
                            onChange={(e) => setForm({ ...form, profession: e.target.value })}
                            placeholder="例如：內容創作者、部落客、講師"
                            className="rounded-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="company">公司 / 組織（選填）</Label>
                        <Input
                            id="company"
                            value={form.company}
                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                            placeholder="例如：自媒體工作室"
                            className="rounded-full"
                        />
                    </div>

                    {/* 社媒平台 */}
                    <div className="space-y-2">
                        <Label>主要平台 *</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {PLATFORMS.map((platform) => {
                                const isSelected = form.platform === platform.id;
                                return (
                                    <button
                                        key={platform.id}
                                        type="button"
                                        onClick={() => setForm({ ...form, platform: platform.id })}
                                        className={`p-3 rounded-xl border-2 transition-all text-center text-sm ${isSelected
                                            ? 'border-black bg-black text-white'
                                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                                            }`}
                                    >
                                        {platform.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="account">帳號 / 連結 *</Label>
                        <Input
                            id="account"
                            value={form.account}
                            onChange={(e) => setForm({ ...form, account: e.target.value })}
                            placeholder="@yourhandle 或 https://..."
                            className="rounded-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="followers">粉絲數 *</Label>
                        <Input
                            id="followers"
                            value={form.followers}
                            onChange={(e) => setForm({ ...form, followers: e.target.value })}
                            placeholder="例如：10K、50000"
                            className="rounded-full"
                        />
                    </div>

                    {/* 賽道/調性 */}
                    <div className="space-y-2">
                        <Label>內容領域 *</Label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => {
                                const isSelected = form.category === cat;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setForm({ ...form, category: cat })}
                                        className={`px-4 py-2 rounded-full text-sm transition-all ${isSelected
                                            ? 'bg-black text-white'
                                            : 'bg-white border border-zinc-200 hover:border-zinc-400'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 辦活動意圖 */}
                    <div className="space-y-2">
                        <Label htmlFor="intention">辦活動意圖（選填）</Label>
                        <Textarea
                            id="intention"
                            value={form.intention}
                            onChange={(e) => setForm({ ...form, intention: e.target.value })}
                            placeholder="您希望透過 Party 辦什麼樣的活動？"
                            className="rounded-xl resize-none"
                            rows={3}
                        />
                    </div>

                    {/* 申請理由 */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">申請理由（選填）</Label>
                        <Textarea
                            id="reason"
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            placeholder="為什麼想成為認證 KOL？"
                            className="rounded-xl resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 rounded-full bg-black text-white hover:bg-zinc-800 text-lg font-bold"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                提交中...
                            </>
                        ) : (
                            '提交申請'
                        )}
                    </Button>

                    <p className="text-xs text-center text-zinc-400">
                        提交後我們將在 3 個工作日內審核並回覆
                    </p>
                </form>
            </div>
        </main>
    );
}
