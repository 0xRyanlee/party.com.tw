"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Crown, Users, Shield, Zap, X } from "lucide-react";
import { toast } from "sonner";

const CLUB_TYPES = [
    { value: 'public', label: 'Public', desc: '任何人可加入', icon: Users },
    { value: 'private', label: 'Private', desc: '僅限邀請', icon: Shield },
    { value: 'vendor', label: 'Vendor', desc: '服務提供者專用', icon: Zap },
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

                    {/* Cover Image URL */}
                    <div className="space-y-2">
                        <Label htmlFor="cover_image">Cover Image URL</Label>
                        <Input
                            id="cover_image"
                            type="url"
                            value={form.cover_image}
                            onChange={(e) => setForm(prev => ({ ...prev, cover_image: e.target.value }))}
                            placeholder="https://..."
                            className="rounded-full"
                        />
                        {form.cover_image && (
                            <div className="h-32 rounded-xl overflow-hidden bg-zinc-100">
                                <img
                                    src={form.cover_image}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
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
                        <Label>Tags (up to 5)</Label>
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
                                placeholder="Add a tag"
                                className="rounded-full flex-1"
                                maxLength={20}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddTag}
                                className="rounded-full"
                            >
                                Add
                            </Button>
                        </div>
                        {form.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {form.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-100 rounded-full text-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="text-zinc-400 hover:text-zinc-600"
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
