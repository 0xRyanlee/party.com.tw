'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, Link as LinkIcon, Facebook, Instagram, Youtube, MessageCircle, Play, AtSign } from 'lucide-react';

interface ExternalLinksProps {
    value: string[];
    onChange: (links: string[]) => void;
    maxLinks?: number;
}

// 平台識別規則
const detectPlatform = (url: string): { icon: React.ReactNode; label: string; color: string } => {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com') || lowerUrl.includes('fb.me')) {
        return { icon: <Facebook className="w-4 h-4" />, label: 'Facebook', color: 'bg-blue-100 text-blue-600' };
    }
    if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
        return { icon: <Instagram className="w-4 h-4" />, label: 'Instagram', color: 'bg-pink-100 text-pink-600' };
    }
    if (lowerUrl.includes('threads.net')) {
        return { icon: <AtSign className="w-4 h-4" />, label: 'Threads', color: 'bg-gray-800 text-white' };
    }
    if (lowerUrl.includes('line.me') || lowerUrl.includes('lin.ee')) {
        return { icon: <MessageCircle className="w-4 h-4" />, label: 'Line', color: 'bg-green-100 text-green-600' };
    }
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return { icon: <Youtube className="w-4 h-4" />, label: 'YouTube', color: 'bg-red-100 text-red-600' };
    }
    if (lowerUrl.includes('tiktok.com')) {
        return { icon: <Play className="w-4 h-4" />, label: 'TikTok', color: 'bg-gray-100 text-gray-800' };
    }

    // 默認
    return { icon: <LinkIcon className="w-4 h-4" />, label: 'Website', color: 'bg-gray-100 text-gray-600' };
};

export default function ExternalLinks({ value, onChange, maxLinks = 3 }: ExternalLinksProps) {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            // 嘗試添加 https://
            try {
                new URL(`https://${url}`);
                return true;
            } catch {
                return false;
            }
        }
    };

    const normalizeUrl = (url: string): string => {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`;
        }
        return url;
    };

    const addLink = () => {
        if (!inputValue.trim()) return;

        if (!isValidUrl(inputValue)) {
            setError('請輸入有效的網址');
            return;
        }

        if (value.length >= maxLinks) {
            setError(`最多只能添加 ${maxLinks} 個連結`);
            return;
        }

        const normalizedUrl = normalizeUrl(inputValue.trim());

        if (value.includes(normalizedUrl)) {
            setError('此連結已存在');
            return;
        }

        onChange([...value, normalizedUrl]);
        setInputValue('');
        setError('');
    };

    const removeLink = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addLink();
        }
    };

    return (
        <div className="space-y-3">
            {/* 已添加的連結 */}
            {value.length > 0 && (
                <div className="space-y-2">
                    {value.map((url, index) => {
                        const platform = detectPlatform(url);
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                            >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${platform.color}`}>
                                    {platform.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-medium text-gray-500">{platform.label}</span>
                                    <p className="text-sm truncate">{url}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeLink(index)}
                                    className="text-gray-400 hover:text-red-500 shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 輸入區 */}
            {value.length < maxLinks && (
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="輸入連結，如 facebook.com/event"
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        onClick={addLink}
                        disabled={!inputValue.trim()}
                        className="bg-black text-white rounded-full shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* 錯誤訊息 */}
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}

            {/* 提示訊息 */}
            <p className="text-xs text-gray-400">
                可添加 {maxLinks - value.length} 個連結 • 支援自動識別 Facebook、Instagram、Threads、Line、YouTube
            </p>
        </div>
    );
}
