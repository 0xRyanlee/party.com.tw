'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

interface VibeAttributesProps {
    vibeType?: 'relax' | 'networking' | 'dating' | 'hobby' | 'nightlife' | 'music' | 'sport';
    theme?: string;
    moodTags?: string[];
    onVibeTypeChange?: (value: 'relax' | 'networking' | 'dating' | 'hobby' | 'nightlife' | 'music' | 'sport') => void;
    onThemeChange?: (value: string) => void;
    onMoodTagsChange?: (tags: string[]) => void;
}

const vibeOptions = [
    { value: 'relax', label: '放鬆休閒', icon: '🧘', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'networking', label: '社交拓展', icon: '🤝', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'dating', label: '交友聯誼', icon: '💕', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    { value: 'hobby', label: '興趣愛好', icon: '🎨', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'nightlife', label: '夜生活', icon: '🌙', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { value: 'music', label: '音樂表演', icon: '🎵', color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'sport', label: '運動健身', icon: '⚽', color: 'bg-orange-100 text-orange-700 border-orange-200' },
];

const moodTagOptions = [
    '熱鬧', '安靜', '浪漫', '活力', '專業',
    '創意', '輕鬆', '高雅', '親密', '自由',
    '刺激', '溫馨', '文青', '潮流', '復古',
];

const themePresets = [
    '萬聖節 🎃',
    '聖誕節 🎄',
    '情人節 💝',
    '春節 🧧',
    '畢業季 🎓',
    '夏日派對 🏖️',
    '復古風 📻',
    '未來感 🚀',
];

export default function VibeAttributes({
    vibeType,
    theme = '',
    moodTags = [],
    onVibeTypeChange,
    onThemeChange,
    onMoodTagsChange,
}: VibeAttributesProps) {
    const [customTheme, setCustomTheme] = useState(theme);

    const toggleMoodTag = (tag: string) => {
        const newTags = moodTags.includes(tag)
            ? moodTags.filter((t) => t !== tag)
            : [...moodTags, tag];
        onMoodTagsChange?.(newTags);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">活動屬性</h3>
                    <p className="text-sm text-gray-500">設定活動的氛圍和風格</p>
                </div>
            </div>

            {/* Vibe Type */}
            <div>
                <Label className="text-base font-medium mb-3 block">活動氛圍</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {vibeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onVibeTypeChange?.(option.value as any)}
                            className={`p-4 rounded-xl border-2 transition-all ${vibeType === option.value
                                    ? `${option.color} border-current font-semibold`
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                        >
                            <div className="text-2xl mb-1">{option.icon}</div>
                            <div className="text-sm">{option.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Theme */}
            <div>
                <Label className="text-base font-medium mb-3 block">活動主題（可選）</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {themePresets.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => {
                                setCustomTheme(preset);
                                onThemeChange?.(preset);
                            }}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${customTheme === preset
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {preset}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    value={customTheme}
                    onChange={(e) => {
                        setCustomTheme(e.target.value);
                        onThemeChange?.(e.target.value);
                    }}
                    placeholder="或自定義主題..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
            </div>

            {/* Mood Tags */}
            <div>
                <Label className="text-base font-medium mb-3 block">
                    心情標籤 <span className="text-sm font-normal text-gray-500">(可多選，最多 5 個)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                    {moodTagOptions.map((tag) => {
                        const isSelected = moodTags.includes(tag);
                        const isDisabled = !isSelected && moodTags.length >= 5;

                        return (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => !isDisabled && toggleMoodTag(tag)}
                                disabled={isDisabled}
                                className={`px-4 py-2 rounded-full text-sm transition-all ${isSelected
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : isDisabled
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
                {moodTags.length > 0 && (
                    <div className="mt-3 text-sm text-gray-600">
                        已選擇 {moodTags.length} / 5 個標籤
                    </div>
                )}
            </div>

            {/* Preview */}
            {vibeType && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                    <h4 className="font-semibold mb-2 text-purple-900">🎨 氛圍預覽</h4>
                    <div className="flex flex-wrap items-center gap-2">
                        {vibeOptions.find((o) => o.value === vibeType) && (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${vibeOptions.find((o) => o.value === vibeType)!.color
                                }`}>
                                {vibeOptions.find((o) => o.value === vibeType)!.icon}{' '}
                                {vibeOptions.find((o) => o.value === vibeType)!.label}
                            </span>
                        )}
                        {theme && (
                            <span className="px-3 py-1 rounded-full text-sm bg-white border border-purple-200 text-purple-700">
                                🎭 {theme}
                            </span>
                        )}
                        {moodTags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 rounded-full text-sm bg-white border border-pink-200 text-pink-700"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
