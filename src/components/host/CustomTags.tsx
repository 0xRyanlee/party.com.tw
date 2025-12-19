'use client';

import { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Tag, Sparkles } from 'lucide-react';
import {
    DEFAULT_TAGS,
    SYSTEM_TAGS,
    useSmartTags,
    getTagLabel,
    type TagInfo
} from '@/lib/smartTags';

interface CustomTagsProps {
    selectedTags?: string[];
    onTagsChange?: (tags: string[]) => void;
    showSmartSuggestions?: boolean;
}

export default function CustomTags({
    selectedTags = [],
    onTagsChange,
    showSmartSuggestions = true,
}: CustomTagsProps) {
    const [customInput, setCustomInput] = useState('');
    const isInitializedRef = useRef(false);
    const prevAllTagsRef = useRef<string[]>([]);

    // 使用智能標籤 Hook
    const {
        selectedTags: internalSelectedTags,
        impliedTags,
        allTags,
        loading,
        toggleTag,
        addCustomTag,
        removeTag,
        setSelectedTags,
    } = useSmartTags(selectedTags);

    // 初始化時同步外部 selectedTags（只執行一次）
    useEffect(() => {
        if (!isInitializedRef.current && selectedTags.length > 0) {
            setSelectedTags(selectedTags);
            isInitializedRef.current = true;
        }
    }, [selectedTags, setSelectedTags]);

    // 當標籤變化時通知父組件（避免無限循環）
    useEffect(() => {
        const tagsChanged = JSON.stringify(allTags) !== JSON.stringify(prevAllTagsRef.current);
        if (tagsChanged && onTagsChange) {
            prevAllTagsRef.current = allTags;
            onTagsChange(allTags);
        }
    }, [allTags, onTagsChange]);

    const handleAddCustomTag = () => {
        if (customInput.trim()) {
            addCustomTag(customInput.trim());
            setCustomInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustomTag();
        }
    };

    // 判斷標籤是否為系統自動添加
    const isImpliedTag = (tag: string) => impliedTags.includes(tag);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-zinc-700" />
                <div>
                    <Label className="text-base font-semibold">Event Tags</Label>
                    <p className="text-sm text-zinc-500">Select or add tags to help attendees understand your event</p>
                </div>
            </div>

            {/* 已選標籤 */}
            {allTags.length > 0 && (
                <div className="bg-zinc-50 rounded-3xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-zinc-600 font-medium">
                            已選標籤 ({internalSelectedTags.length})
                            {impliedTags.length > 0 && (
                                <span className="text-zinc-400 ml-2">
                                    + {impliedTags.length} 自動添加
                                </span>
                            )}
                        </p>
                        {allTags.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setSelectedTags([])}
                                className="text-xs text-zinc-400 hover:text-zinc-600"
                            >
                                清除全部
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {/* 用戶選擇的標籤 */}
                        {internalSelectedTags.map((tag) => (
                            <div
                                key={tag}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-full text-sm font-medium"
                            >
                                <span>{getTagLabel(tag)}</span>
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 hover:text-red-300 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {/* 系統自動添加的標籤 */}
                        {impliedTags.map((tag) => (
                            <div
                                key={tag}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-200 text-zinc-600 rounded-full text-sm"
                                title="系統自動添加"
                            >
                                <Sparkles className="w-3 h-3" />
                                <span>{getTagLabel(tag)}</span>
                            </div>
                        ))}
                    </div>

                    {/* 智能標籤提示 */}
                    {showSmartSuggestions && impliedTags.length > 0 && (
                        <p className="text-xs text-zinc-400">
                            提示：系統根據您的選擇自動添加了相關標籤
                        </p>
                    )}
                </div>
            )}

            {/* 常用標籤 */}
            <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-700">常用標籤</p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {DEFAULT_TAGS.map((tag) => {
                        const isSelected = internalSelectedTags.includes(tag.value);
                        const isImplied = isImpliedTag(tag.value);

                        return (
                            <button
                                key={tag.value}
                                type="button"
                                onClick={() => toggleTag(tag.value)}
                                disabled={isImplied}
                                className={`
                                    flex items-center justify-center gap-2 px-3 py-2.5 rounded-full 
                                    border-2 transition-all text-sm font-medium
                                    ${isSelected
                                        ? 'border-black bg-black text-white'
                                        : isImplied
                                            ? 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed'
                                            : 'border-zinc-200 hover:border-zinc-400'
                                    }
                                `}
                            >
                                {isImplied && <Sparkles className="w-3 h-3" />}
                                {tag.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 自定義標籤輸入 */}
            <div className="border-2 border-dashed border-zinc-200 rounded-3xl p-4 space-y-3">
                <Label className="text-sm font-medium">新增自定義標籤</Label>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="例如：Startup、Web3、區塊鏈..."
                        className="flex-1 rounded-full"
                        maxLength={20}
                    />
                    <button
                        type="button"
                        onClick={handleAddCustomTag}
                        disabled={!customInput.trim()}
                        className="px-5 py-2 bg-black text-white rounded-full hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                    >
                        新增
                    </button>
                </div>
                <p className="text-xs text-zinc-400">
                    提示：輸入活動特色，系統會自動匹配相關標籤。按 Enter 快速新增。
                </p>
            </div>

            {/* Loading 狀態 */}
            {loading && (
                <div className="text-center py-4">
                    <div className="inline-block w-4 h-4 border-2 border-zinc-300 border-t-black rounded-full animate-spin" />
                    <p className="text-xs text-zinc-400 mt-2">載入標籤規則中...</p>
                </div>
            )}
        </div>
    );
}
