'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Tag, Circle } from 'lucide-react';

interface CustomTagsProps {
    selectedTags?: string[];
    customTags?: string[];
    onTagsChange?: (tags: string[]) => void;
}

// 預設標籤分類（移除 emoji）
const DEFAULT_TAGS = {
    活動類型: [
        { value: 'sport', label: '運動健身', icon: Circle },
        { value: 'bar', label: '酒吧夜店', icon: Circle },
        { value: 'coffee', label: '咖啡聚會', icon: Circle },
        { value: 'meetup', label: '聚會交流', icon: Circle },
        { value: 'workshop', label: '工作坊', icon: Circle },
        { value: 'conference', label: '研討會', icon: Circle },
        { value: 'networking', label: '商務社交', icon: Circle },
        { value: 'music', label: '音樂演出', icon: Circle },
    ],
    興趣主題: [
        { value: 'tech', label: '科技', icon: Circle },
        { value: 'art', label: '藝術', icon: Circle },
        { value: 'food', label: '美食', icon: Circle },
        { value: 'travel', label: '旅遊', icon: Circle },
        { value: 'photography', label: '攝影', icon: Circle },
        { value: 'gaming', label: '遊戲', icon: Circle },
        { value: 'reading', label: '閱讀', icon: Circle },
        { value: 'movie', label: '電影', icon: Circle },
    ],
    氛圍: [
        { value: 'casual', label: '輕鬆休閒', icon: Circle },
        { value: 'formal', label: '正式專業', icon: Circle },
        { value: 'party', label: '派對狂歡', icon: Circle },
        { value: 'chill', label: '放鬆療癒', icon: Circle },
        { value: 'active', label: '活力充沛', icon: Circle },
        { value: 'creative', label: '創意發想', icon: Circle },
    ],
    特色: [
        { value: 'outdoor', label: '戶外活動', icon: Circle },
        { value: 'indoor', label: '室內活動', icon: Circle },
        { value: 'free', label: '免費參加', icon: Circle },
        { value: 'beginner', label: '新手友善', icon: Circle },
        { value: 'pet-friendly', label: '攜帶寵物', icon: Circle },
        { value: 'kids-friendly', label: '親子友善', icon: Circle },
        { value: 'lgbtq', label: 'LGBTQ+', icon: Circle },
        { value: 'eco', label: '環保永續', icon: Circle },
    ],
};

export default function CustomTags({
    selectedTags = [],
    customTags = [],
    onTagsChange,
}: CustomTagsProps) {
    const [customInput, setCustomInput] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('活動類型');

    const allTags = [...selectedTags, ...customTags];

    const toggleTag = (tagValue: string) => {
        const newTags = allTags.includes(tagValue)
            ? allTags.filter((t) => t !== tagValue)
            : [...allTags, tagValue];
        onTagsChange?.(newTags);
    };

    const addCustomTag = () => {
        if (customInput.trim() && !allTags.includes(customInput.trim())) {
            const newTags = [...allTags, customInput.trim()];
            onTagsChange?.(newTags);
            setCustomInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomTag();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-700" />
                <div>
                    <Label className="text-base font-semibold">活動標籤</Label>
                    <p className="text-sm text-gray-500">選擇或新增標籤，幫助參與者了解活動特色</p>
                </div>
            </div>

            {/* 已選標籤 */}
            {allTags.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-2">已選標籤 ({allTags.length})</p>
                    <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => {
                            const tagInfo = Object.values(DEFAULT_TAGS)
                                .flat()
                                .find((t) => t.value === tag);
                            return (
                                <div
                                    key={tag}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-full text-sm font-medium"
                                >
                                    <span>{tagInfo?.label || tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className="ml-1 hover:text-red-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 類別切換 */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.keys(DEFAULT_TAGS).map((category) => (
                    <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeCategory === category
                            ? 'bg-black text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* 預設標籤選擇 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {DEFAULT_TAGS[activeCategory as keyof typeof DEFAULT_TAGS]?.map((tag) => {
                    const Icon = tag.icon;
                    return (
                        <button
                            key={tag.value}
                            type="button"
                            onClick={() => toggleTag(tag.value)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-full border-2 transition-all text-left ${allTags.includes(tag.value)
                                ? 'border-black bg-black text-white'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${allTags.includes(tag.value) ? 'text-white fill-white' : 'text-gray-400'}`} />
                            <span className="font-medium text-sm">{tag.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* 自定義標籤輸入 */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                <Label className="text-sm font-medium mb-2 block">新增自定義標籤</Label>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="例如：Startup、Web3、區塊鏈..."
                        className="flex-1"
                        maxLength={20}
                    />
                    <button
                        type="button"
                        onClick={addCustomTag}
                        disabled={!customInput.trim()}
                        className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        新增
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    提示：按 Enter 鍵快速新增標籤
                </p>
            </div>
        </div>
    );
}
