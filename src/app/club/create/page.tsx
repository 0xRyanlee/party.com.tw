"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Crown, Users, Shield, Zap, X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const CLUB_TYPES = [
    { value: 'public', label: 'Public', desc: '任何人可加入', icon: Users },
    { value: 'private', label: 'Private', desc: '僅限邀請', icon: Shield },
    { value: 'vendor', label: 'Vendor', desc: '服務提供者專用', icon: Zap },
];

// Preset tags for clubs
const PRESET_TAGS = [
    'technology', 'startup', 'design', 'music', 'sports',
    'outdoor', 'food', 'travel', 'photography', 'gaming',
    'art', 'reading', 'networking', 'fitness', 'language'
];

export default function CreateClubPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        cover_image: '',
        club_type: 'public' as 'public' | 'private' | 'vendor',
        tags: [] as string[],
    });
    const [tagInput, setTagInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleAddTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
            setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            toast.error('請輸入俱樂部名稱');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/clubs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (response.ok) {
                const club = await response.json();
                toast.success('俱樂部創建成功！');
                router.push(`/club/${club.id}`);
            } else {
                const data = await response.json();
                toast.error(data.error || '創建失敗');
            }
        } catch (error) {
            console.error('Error creating club:', error);
            toast.error('創建失敗');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-zinc-50 pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-zinc-100 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">創建俱樂部</h1>
            </header>

            <div className="container mx-auto px-4 py-6 max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Club Icon */}
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-black to-zinc-800 flex items-center justify-center">
                            <Crown className="w-10 h-10 text-yellow-400" />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">俱樂部名稱 *</Label>
                        <Input
                            id="name"
                            value={form.name}
                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="例如：台北科技小聚"
                            className="rounded-full"
                            maxLength={50}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">俱樂部簡介</Label>
                        <Textarea
                            id="description"
                            value={form.description}
                            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="這個俱樂部的宗旨是什麼？"
                            className="rounded-xl resize-none"
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-2">
                        <Label>封面圖片</Label>
                        <div className="relative">
                            {form.cover_image ? (
                                <div className="relative h-40 rounded-xl overflow-hidden bg-zinc-100">
                                    <img
                                        src={form.cover_image}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, cover_image: '' }))}
                                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer hover:border-zinc-400 transition-colors bg-zinc-50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            if (file.size > 5 * 1024 * 1024) {
                                                toast.error('圖片大小不可超過 5MB');
                                                return;
                                            }
                                            setIsUploading(true);
                                            try {
                                                const supabase = createClient();
                                                const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
                                                const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-');
                                                const fileName = `clubs/${timestamp}-${cleanName}`;

                                                const { data, error } = await supabase.storage
                                                    .from('images')
                                                    .upload(fileName, file, {
                                                        cacheControl: '3600',
                                                        upsert: true
                                                    });

                                                if (error) throw error;

                                                const { data: { publicUrl } } = supabase.storage
                                                    .from('images')
                                                    .getPublicUrl(data.path);

                                                setForm(prev => ({ ...prev, cover_image: publicUrl }));
                                                toast.success('上傳成功');
                                            } catch (err: any) {
                                                console.error('Upload error:', err);
                                                toast.error('上傳失敗: ' + (err.message || '未知錯誤'));
                                            } finally {
                                                setIsUploading(false);
                                            }
                                        }}
                                    />
                                    {isUploading ? (
                                        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                                            <span className="text-sm text-zinc-500">點擊上傳圖片</span>
                                            <span className="text-xs text-zinc-400 mt-1">最大 5MB</span>
                                        </>
                                    )}
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Club Type */}
                    <div className="space-y-2">
                        <Label>俱樂部類型</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {CLUB_TYPES.map((type) => {
                                const Icon = type.icon;
                                const isSelected = form.club_type === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, club_type: type.value as never }))}
                                        className={`p-4 rounded-xl border-2 transition-all text-center ${isSelected
                                            ? 'border-black bg-black text-white'
                                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-zinc-600'}`} />
                                        <p className="font-medium text-sm">{type.label}</p>
                                        <p className={`text-xs mt-1 ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                                            {type.desc}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label>標籤（最多 5 個）</Label>
                        {/* Preset tag suggestions */}
                        <div className="flex flex-wrap gap-2">
                            {PRESET_TAGS.filter(t => !form.tags.includes(t)).slice(0, 10).map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => {
                                        if (form.tags.length < 5) {
                                            setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                                        }
                                    }}
                                    disabled={form.tags.length >= 5}
                                    className="px-3 py-1 text-sm rounded-full border border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                        {/* Custom tag input */}
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                placeholder="自定義標籤..."
                                className="rounded-full flex-1"
                                maxLength={20}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddTag}
                                disabled={form.tags.length >= 5}
                                className="rounded-full"
                            >
                                新增
                            </Button>
                        </div>
                        {/* Selected tags */}
                        {form.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {form.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white rounded-full text-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="text-zinc-300 hover:text-white"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={isLoading || !form.name.trim()}
                        className="w-full h-12 rounded-full bg-black text-white hover:bg-zinc-800"
                    >
                        {isLoading ? '創建中...' : '創建俱樂部'}
                    </Button>
                </form>
            </div>
        </main>
    );
}
