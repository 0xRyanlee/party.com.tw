'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Download,
    Share2,
    Palette,
    Type,
    Image as ImageIcon,
    Loader2,
    Check,
    Copy,
    Calendar,
    MapPin,
    Clock,
    Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface EventData {
    title: string;
    subtitle?: string;
    coverImage?: string;
    startTime: string;
    endTime?: string;
    venueName?: string;
    address?: string;
    organizerName?: string;
    tags?: string[];
}

interface PosterTemplate {
    id: string;
    name: string;
    description: string;
    bgGradient: string;
    textColor: string;
    accentColor: string;
}

const POSTER_TEMPLATES: PosterTemplate[] = [
    {
        id: 'midnight',
        name: '午夜派對',
        description: '深色漸層，適合夜店和派對活動',
        bgGradient: 'from-gray-900 via-purple-900 to-black',
        textColor: 'text-white',
        accentColor: 'text-purple-400',
    },
    {
        id: 'sunrise',
        name: '日出金橙',
        description: '溫暖漸層，適合晨間活動和工作坊',
        bgGradient: 'from-orange-500 via-pink-500 to-purple-600',
        textColor: 'text-white',
        accentColor: 'text-yellow-300',
    },
    {
        id: 'ocean',
        name: '海洋清新',
        description: '藍綠漸層，適合戶外和夏日活動',
        bgGradient: 'from-teal-400 via-cyan-500 to-blue-600',
        textColor: 'text-white',
        accentColor: 'text-cyan-200',
    },
    {
        id: 'minimal',
        name: '極簡白',
        description: '簡潔設計，適合商務和專業活動',
        bgGradient: 'from-gray-50 via-white to-gray-100',
        textColor: 'text-gray-900',
        accentColor: 'text-gray-600',
    },
    {
        id: 'neon',
        name: '霓虹電音',
        description: '鮮豔對比，適合電音和科技活動',
        bgGradient: 'from-pink-600 via-purple-700 to-indigo-800',
        textColor: 'text-white',
        accentColor: 'text-pink-300',
    },
    {
        id: 'forest',
        name: '森林綠意',
        description: '自然色彩，適合戶外和環保活動',
        bgGradient: 'from-green-800 via-emerald-700 to-teal-800',
        textColor: 'text-white',
        accentColor: 'text-emerald-300',
    },
];

interface PosterGeneratorProps {
    event?: EventData;
    isOpen: boolean;
    onClose: () => void;
}

export default function PosterGenerator({ event, isOpen, onClose }: PosterGeneratorProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<PosterTemplate>(POSTER_TEMPLATES[0]);
    const [customTitle, setCustomTitle] = useState(event?.title || '');
    const [customSubtitle, setCustomSubtitle] = useState(event?.subtitle || '');
    const [customVenue, setCustomVenue] = useState(event?.venueName || '');
    const [customDate, setCustomDate] = useState(event?.startTime || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const formatEventDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return format(date, 'yyyy年MM月dd日 (EEEE) HH:mm', { locale: zhTW });
        } catch {
            return dateStr;
        }
    };

    const handleDownload = useCallback(async () => {
        if (!canvasRef.current) return;

        setIsGenerating(true);
        try {
            // Use html2canvas to capture the poster
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(canvasRef.current, {
                scale: 2,
                backgroundColor: null,
                useCORS: true,
            });

            const link = document.createElement('a');
            link.download = `poster-${customTitle || 'event'}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Error generating poster:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [customTitle]);

    const handleCopyLink = () => {
        // Generate shareable link with event details
        const params = new URLSearchParams({
            title: customTitle,
            subtitle: customSubtitle,
            venue: customVenue,
            date: customDate,
            template: selectedTemplate.id,
        });
        const shareUrl = `${window.location.origin}/api/og?${params.toString()}`;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        海報生成器
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Preview */}
                    <div className="space-y-4">
                        <Label className="text-sm font-medium">預覽</Label>
                        <div
                            ref={canvasRef}
                            className={`aspect-[3/4] rounded-2xl bg-gradient-to-br ${selectedTemplate.bgGradient} p-6 flex flex-col justify-between overflow-hidden relative shadow-2xl`}
                        >
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                            {/* Top section */}
                            <div className="relative z-10">
                                <div className={`text-sm ${selectedTemplate.accentColor} font-medium mb-2 flex items-center gap-1`}>
                                    <Sparkles className="w-4 h-4" />
                                    活動邀請
                                </div>
                            </div>

                            {/* Center section - Title */}
                            <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
                                <h1 className={`text-3xl md:text-4xl font-bold ${selectedTemplate.textColor} leading-tight mb-3`}>
                                    {customTitle || '活動名稱'}
                                </h1>
                                {customSubtitle && (
                                    <p className={`text-lg ${selectedTemplate.accentColor} opacity-80`}>
                                        {customSubtitle}
                                    </p>
                                )}
                            </div>

                            {/* Bottom section - Details */}
                            <div className={`relative z-10 space-y-3 ${selectedTemplate.textColor}`}>
                                {customDate && (
                                    <div className="flex items-center gap-2 text-sm opacity-90">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatEventDate(customDate)}</span>
                                    </div>
                                )}
                                {customVenue && (
                                    <div className="flex items-center gap-2 text-sm opacity-90">
                                        <MapPin className="w-4 h-4" />
                                        <span>{customVenue}</span>
                                    </div>
                                )}

                                {/* QR code placeholder */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                                    <div className="text-xs opacity-60">掃碼報名</div>
                                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-200 rounded grid grid-cols-3 gap-0.5 p-1">
                                            {[...Array(9)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-transparent'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Download & Share buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleDownload}
                                disabled={isGenerating}
                                className="flex-1 rounded-full gap-2"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                下載 PNG
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCopyLink}
                                className="flex-1 rounded-full gap-2"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                                {copied ? '已複製' : '複製分享連結'}
                            </Button>
                        </div>
                    </div>

                    {/* Right: Controls */}
                    <div className="space-y-6">
                        {/* Template Selection */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                選擇模板
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {POSTER_TEMPLATES.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template)}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${selectedTemplate.id === template.id
                                                ? 'border-black bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className={`h-8 rounded-lg bg-gradient-to-r ${template.bgGradient} mb-2`} />
                                        <div className="text-sm font-medium">{template.name}</div>
                                        <div className="text-xs text-gray-500 line-clamp-1">{template.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Text Customization */}
                        <div className="space-y-4">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Type className="w-4 h-4" />
                                自訂內容
                            </Label>

                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs text-gray-500">活動標題</Label>
                                    <Input
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        placeholder="輸入活動名稱"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs text-gray-500">副標題</Label>
                                    <Input
                                        value={customSubtitle}
                                        onChange={(e) => setCustomSubtitle(e.target.value)}
                                        placeholder="輸入副標題或 Slogan"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs text-gray-500">日期時間</Label>
                                    <Input
                                        type="datetime-local"
                                        value={customDate}
                                        onChange={(e) => setCustomDate(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs text-gray-500">活動地點</Label>
                                    <Input
                                        value={customVenue}
                                        onChange={(e) => setCustomVenue(e.target.value)}
                                        placeholder="輸入場地名稱"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                            <div className="font-medium mb-2">💡 使用提示</div>
                            <ul className="space-y-1 text-xs">
                                <li>• 下載的海報為 PNG 格式，適合社群分享</li>
                                <li>• 分享連結會生成動態 OG 圖片</li>
                                <li>• 建議標題控制在 20 字以內效果最佳</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Standalone page component
export function PosterGeneratorPage() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Button onClick={() => setIsOpen(true)} className="rounded-full gap-2">
                <Palette className="w-4 h-4" />
                開啟海報生成器
            </Button>
            <PosterGenerator isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    );
}
