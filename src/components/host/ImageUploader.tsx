"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Image as ImageIcon, Upload, X, Tag } from "lucide-react";

interface ImageUploaderProps {
    value?: string;
    onChange: (value: string) => void;
    enabled?: boolean;
    onEnabledChange?: (enabled: boolean) => void;
    showToggle?: boolean;
}

export default function ImageUploader({
    value,
    onChange,
    enabled = true,
    onEnabledChange,
    showToggle = true,
}: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | undefined>(value);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                onChange(result); // In real app, upload to server here and return URL
            };
            reader.readAsDataURL(file);
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
                        <Label className="text-base font-semibold">媒體素材</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500">
                            {enabled ? '已啟用' : '未啟用'}
                        </span>
                        <Switch
                            checked={enabled}
                            onCheckedChange={handleToggle}
                        />
                    </div>
                </div>
            )}

            {/* Content - Only show when enabled */}
            {enabled ? (
                <div
                    onClick={() => inputRef.current?.click()}
                    className={`
                        relative group cursor-pointer
                        border-2 border-dashed rounded-3xl p-8
                        flex flex-col items-center justify-center
                        transition-all duration-200
                        ${preview
                            ? 'border-transparent p-0 overflow-hidden aspect-video'
                            : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                        }
                    `}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {preview ? (
                        <>
                            <img src={preview} alt="Event cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-white font-medium flex items-center gap-2">
                                    <Upload className="w-4 h-4" /> 更換圖片
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                <ImageIcon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-700">點擊上傳封面圖片</p>
                                <p className="text-xs text-zinc-400">SVG, PNG, JPG or GIF (最大 800x400px)</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-zinc-50 rounded-3xl p-6 text-center">
                    <ImageIcon className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">此活動不需要封面圖片</p>
                    <p className="text-xs text-zinc-400 mt-1">開啟上方開關以添加媒體素材</p>
                </div>
            )}
        </div>
    );
}
