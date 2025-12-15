/**
 * Smart Tag System - 智能標籤推理系統
 * 
 * 平台核心功能：自動匹配從屬包含關係的 tag 串
 * 例如：選擇「酒吧」自動添加「18+」、「nightlife」
 */

import { createClient } from '@/lib/supabase/client';

// ============================================
// Types
// ============================================

export interface TagRule {
    id: string;
    source_tag: string;
    implied_tags: string[];
    rule_type: 'implies' | 'requires' | 'excludes';
    priority: number;
    is_active: boolean;
    description: string | null;
}

export interface TagStats {
    tag: string;
    usage_count: number;
    last_used_at: string;
}

export interface TagInfo {
    value: string;
    label: string;
    isImplied?: boolean; // 是否為自動推理的標籤
}

// ============================================
// 預設標籤定義（前端顯示用）
// ============================================

export const DEFAULT_TAGS: TagInfo[] = [
    // Activity Types
    { value: 'sport', label: 'Sport & Fitness' },
    { value: 'bar', label: 'Bar & Nightclub' },
    { value: 'cafe', label: 'Cafe & Coffee' },
    { value: 'meetup', label: 'Meetup & Social' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'conference', label: 'Conference' },
    { value: 'networking', label: 'Networking' },
    { value: 'music', label: 'Music & Concert' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'art', label: 'Art & Culture' },
    { value: 'tech', label: 'Tech & Innovation' },
    { value: 'outdoor', label: 'Outdoor' },
];

// System Tags（通常由系統自動添加）
export const SYSTEM_TAGS: TagInfo[] = [
    { value: '18+', label: '18+ Only' },
    { value: 'nightlife', label: 'Nightlife' },
    { value: 'indoor', label: 'Indoor' },
    { value: 'social', label: 'Social' },
    { value: 'learning', label: 'Learning' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'nature', label: 'Nature' },
    { value: 'business', label: 'Business' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'culture', label: 'Culture' },
    { value: 'party', label: 'Party' },
    { value: 'fitness', label: 'Fitness' },
];

// ============================================
// API Functions
// ============================================

/**
 * 從資料庫獲取所有活躍的標籤規則
 * 如果表不存在或發生錯誤，返回空陣列（優雅降級）
 */
export async function fetchTagRules(): Promise<TagRule[]> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('tag_inference_rules')
            .select('*')
            .eq('is_active', true)
            .order('priority', { ascending: false });

        // 靜默處理錯誤（表可能不存在）
        if (error) {
            // 只在開發環境 debug 時輸出
            if (process.env.NODE_ENV === 'development' && process.env.DEBUG_TAGS === 'true') {
                console.warn('Tag rules not available:', error.message);
            }
            return [];
        }

        return data || [];
    } catch {
        // 網路錯誤或其他異常
        return [];
    }
}

/**
 * 獲取熱門標籤（用於推薦）
 */
export async function fetchPopularTags(limit = 20): Promise<TagStats[]> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('tag_usage_stats')
            .select('*')
            .order('usage_count', { ascending: false })
            .limit(limit);

        if (error) {
            return [];
        }

        return data || [];
    } catch {
        return [];
    }
}

/**
 * 使用資料庫函數獲取隱含標籤
 */
export async function getImpliedTagsFromDB(tags: string[]): Promise<string[]> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .rpc('get_implied_tags', { input_tags: tags });

        if (error) {
            return tags;
        }

        return data || tags;
    } catch {
        return tags;
    }
}

// ============================================
// Local Logic (不需要 API 調用)
// ============================================

/**
 * 在本地應用智能標籤規則
 * 用於即時預覽，不需要等待 API
 */
export function applySmartTags(
    selectedTags: string[],
    rules: TagRule[]
): { allTags: string[]; impliedTags: string[] } {
    const allTags = new Set(selectedTags);
    const impliedTags = new Set<string>();

    // 遞歸應用規則（最多 5 層防止無限循環）
    let iterations = 0;
    let changed = true;

    while (changed && iterations < 5) {
        changed = false;

        for (const tag of Array.from(allTags)) {
            const applicableRules = rules.filter(r =>
                r.source_tag === tag &&
                r.rule_type === 'implies' &&
                r.is_active
            );

            for (const rule of applicableRules) {
                for (const impliedTag of rule.implied_tags) {
                    if (!allTags.has(impliedTag)) {
                        allTags.add(impliedTag);
                        impliedTags.add(impliedTag);
                        changed = true;
                    }
                }
            }
        }

        iterations++;
    }

    return {
        allTags: Array.from(allTags),
        impliedTags: Array.from(impliedTags)
    };
}

/**
 * 獲取標籤的顯示名稱
 */
export function getTagLabel(tagValue: string): string {
    const allTags = [...DEFAULT_TAGS, ...SYSTEM_TAGS];
    const tag = allTags.find(t => t.value === tagValue);
    return tag?.label || tagValue;
}

/**
 * 檢查標籤是否需要 18+ 限制
 */
export function requiresAdultOnly(tags: string[]): boolean {
    return tags.includes('18+');
}

/**
 * 根據當前標籤推薦相關標籤
 */
export function getSuggestedTags(
    currentTags: string[],
    rules: TagRule[],
    limit = 5
): string[] {
    const suggestions = new Set<string>();

    // 基於當前標籤的規則反向查找
    for (const rule of rules) {
        // 如果用戶有某個隱含標籤，推薦觸發它的源標籤
        for (const impliedTag of rule.implied_tags) {
            if (currentTags.includes(impliedTag) && !currentTags.includes(rule.source_tag)) {
                suggestions.add(rule.source_tag);
            }
        }
    }

    return Array.from(suggestions).slice(0, limit);
}

/**
 * 驗證標籤組合是否有效
 * 檢查 excludes 類型的規則
 */
export function validateTagCombination(
    tags: string[],
    rules: TagRule[]
): { valid: boolean; conflicts: string[] } {
    const conflicts: string[] = [];

    for (const tag of tags) {
        const excludeRules = rules.filter(r =>
            r.source_tag === tag &&
            r.rule_type === 'excludes' &&
            r.is_active
        );

        for (const rule of excludeRules) {
            for (const excludedTag of rule.implied_tags) {
                if (tags.includes(excludedTag)) {
                    conflicts.push(`${tag} 與 ${excludedTag} 不能同時使用`);
                }
            }
        }
    }

    return {
        valid: conflicts.length === 0,
        conflicts
    };
}

// ============================================
// Hooks (React)
// ============================================

import { useState, useEffect, useCallback } from 'react';

/**
 * 使用智能標籤系統的 Hook
 */
export function useSmartTags(initialTags: string[] = []) {
    const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
    const [rules, setRules] = useState<TagRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [impliedTags, setImpliedTags] = useState<string[]>([]);

    // 載入規則
    useEffect(() => {
        fetchTagRules().then(data => {
            setRules(data);
            setLoading(false);
        });
    }, []);

    // 當選擇的標籤變化時，計算隱含標籤
    useEffect(() => {
        if (rules.length > 0) {
            const result = applySmartTags(selectedTags, rules);
            setImpliedTags(result.impliedTags);
        }
    }, [selectedTags, rules]);

    const toggleTag = useCallback((tag: string) => {
        setSelectedTags(prev => {
            if (prev.includes(tag)) {
                // 移除標籤時，也移除依賴它的隱含標籤
                return prev.filter(t => t !== tag);
            } else {
                return [...prev, tag];
            }
        });
    }, []);

    const addCustomTag = useCallback((tag: string) => {
        const trimmed = tag.trim().toLowerCase();
        if (trimmed && !selectedTags.includes(trimmed)) {
            setSelectedTags(prev => [...prev, trimmed]);
        }
    }, [selectedTags]);

    const removeTag = useCallback((tag: string) => {
        setSelectedTags(prev => prev.filter(t => t !== tag));
    }, []);

    const clearTags = useCallback(() => {
        setSelectedTags([]);
    }, []);

    // 所有標籤（用戶選擇 + 系統推理）
    const allTags = [...new Set([...selectedTags, ...impliedTags])];

    return {
        selectedTags,       // 用戶明確選擇的標籤
        impliedTags,        // 系統自動推理的標籤
        allTags,            // 所有標籤（用於提交）
        rules,
        loading,
        toggleTag,
        addCustomTag,
        removeTag,
        clearTags,
        setSelectedTags,
    };
}
