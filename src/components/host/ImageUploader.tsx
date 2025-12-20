"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Upload, X, Tag, Info, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface ImageMetadata {
    alt?: string;
    caption?: string;
    tags?: string[];
    scene?: string;
    entity_relation?: string;
}

interface ImageUploaderProps {
    value?: string;
    onChange: (value: string) => void;
    metadata?: ImageMetadata;
    onMetadataChange?: (metadata: ImageMetadata) => void;
    enabled?: boolean;
    onEnabledChange?: (enabled: boolean) => void;
    showToggle?: boolean;
    pathPrefix?: string; // e.g., 'events', 'banners'
}

export default function ImageUploader({
    value,
    onChange,
    metadata = {},
    onMetadataChange,
    enabled = true,
    onEnabledChange,
    showToggle = true,
    pathPrefix = "events",
}: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | undefined>(value);
    const [isUploading, setIsUploading] = useState(false);
    const [showMetadata, setShowMetadata] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    useEffect(() => {
        setPreview(value);
    }, [value]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.size > 5 * 1024 * 1024) {
            toast.error("檔案太大（最大 5MB）");
            return;
        }

        setIsUploading(true);
        try {
            // Generate semantic filename
            const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14);
            const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, "-");
            const fileName = `${pathPrefix}/${timestamp}-${cleanName}`;

            const { data, error } = await supabase.storage
                .from("images")
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: true,
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("images")
                .getPublicUrl(data.path);

            setPreview(publicUrl);
            onChange(publicUrl);
            toast.success("圖片上傳成功");

            // Auto-fill alt text if empty
            if (!metadata.alt) {
                onMetadataChange?.({ ...metadata, alt: file.name.split('.')[0] });
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("上傳失敗：" + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(undefined);
        onChange("");
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleToggle = (checked: boolean) => {
        onEnabledChange?.(checked);
        if (!checked) {
            handleRemove();
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with Toggle */}
            {showToggle && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-zinc-700" />
                        <Label className="text-base font-semibold">媒體素材與 SEO</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={enabled}
                            onCheckedChange={handleToggle}
                        />
                        <span className="text-sm text-zinc-500 min-w-[50px]">
                            {enabled ? "已啟用" : "已關閉"}
                        </span>
                    </div>
                </div>
            )}

            {/* Content - Only show when enabled */}
            {enabled ? (
                <div className="space-y-4">
                    <div
                        onClick={() => !isUploading && inputRef.current?.click()}
                        className={`
                            relative group cursor-pointer
                            border-2 border-dashed rounded-3xl p-8
                            flex flex-col items-center justify-center
                            transition-all duration-300
                            ${preview
                                ? "border-transparent p-0 overflow-hidden aspect-video bg-zinc-100"
                                : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                            }
                            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />

                        {isUploading ? (
                            <div className="text-center space-y-2">
                                <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mx-auto" />
                                <p className="text-sm text-zinc-500">上傳中...</p>
                            </div>
                        ) : preview ? (
                            <>
                                <img
                                    src={preview}
                                    alt={metadata.alt || "Preview"}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-white font-bold text-sm">更換圖片</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-4 right-4 rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove();
                                    }}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </>
                        ) : (
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-zinc-200 transition-all duration-500">
                                    <ImageIcon className="w-8 h-8 text-zinc-400 group-hover:text-zinc-600" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-zinc-700">點擊上傳主視覺</p>
                                    <p className="text-xs text-zinc-400 mt-1 max-w-[240px]">
                                        建議尺寸 1200x630 (OG 標準)<br />
                                        支援 SVG, PNG, JPG 或 WebP (最大 5MB)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Metadata Metadata Editor */}
                    {preview && onMetadataChange && (
                        <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100">
                            <button
                                type="button"
                                onClick={() => setShowMetadata(!showMetadata)}
                                className="flex items-center justify-between w-full group"
                            >
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
                                    <span className="text-sm font-bold text-zinc-700 group-hover:text-black transition-colors">
                                        結構化元數據 (SEO / LLM 友好)
                                    </span>
                                </div>
                                <div className="text-xs text-zinc-400 group-hover:text-zinc-600">
                                    {showMetadata ? "收起" : "展開編輯"}
                                </div>
                            </button>

                            {showMetadata && (
                                <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">替代文字 (Alt Text)</Label>
                                        <Input
                                            placeholder="精簡描述圖片內容，有助於 SEO 與螢幕閱讀器"
                                            value={metadata.alt || ""}
                                            onChange={(e) => onMetadataChange({ ...metadata, alt: e.target.value })}
                                            className="rounded-xl border-zinc-200 focus:ring-black bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">圖片標題 (Caption)</Label>
                                        <Input
                                            placeholder="顯示在圖片下方的說明文字"
                                            value={metadata.caption || ""}
                                            onChange={(e) => onMetadataChange({ ...metadata, caption: e.target.value })}
                                            className="rounded-xl border-zinc-200 focus:ring-black bg-white"
                                        />
                                    </div>
                                    <div className="flex items-start gap-2 p-3 bg-zinc-100 rounded-2xl text-[10px] text-zinc-500">
                                        <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                        <p>
                                            提示：良好的元數據能提升活動在 Google 搜尋的曝光率，並讓 AI 客服能更精準地理解您的視覺內容。
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-zinc-50 rounded-3xl p-10 text-center border-2 border-dotted border-zinc-200">
                    <ImageIcon className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-zinc-400">媒體素材功能已停用</p>
                    <p className="text-xs text-zinc-400 mt-2">若您的活動需要主視覺，請開啟上方開關</p>
                </div>
            )}
        </div>
    );
}
