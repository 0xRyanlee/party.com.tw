/**
 * 敏感詞檢測工具
 * 用於檢測文本內容中是否包含敏感詞
 */

export interface SensitiveWord {
    id: string;
    word: string;
    category: 'political' | 'adult' | 'gambling' | 'fraud' | 'violence' | 'other';
    match_type: 'exact' | 'fuzzy';
}

export interface CheckResult {
    hasSensitive: boolean;
    matches: {
        word: string;
        category: string;
        positions: number[];
    }[];
}

// 預設敏感詞庫（實際應從資料庫獲取）
const defaultSensitiveWords: SensitiveWord[] = [
    { id: '1', word: '博彩', category: 'gambling', match_type: 'fuzzy' },
    { id: '2', word: '賭場', category: 'gambling', match_type: 'exact' },
    { id: '3', word: '詐騙', category: 'fraud', match_type: 'fuzzy' },
    { id: '4', word: '投資理財', category: 'fraud', match_type: 'exact' },
    { id: '5', word: '色情', category: 'adult', match_type: 'fuzzy' },
    { id: '6', word: '暴力', category: 'violence', match_type: 'fuzzy' },
];

/**
 * 檢測文本中的敏感詞
 * @param text 待檢測文本
 * @param words 敏感詞列表（可選，默認使用預設詞庫）
 * @returns 檢測結果
 */
export function checkSensitiveWords(
    text: string,
    words: SensitiveWord[] = defaultSensitiveWords
): CheckResult {
    const matches: CheckResult['matches'] = [];
    const lowerText = text.toLowerCase();

    for (const word of words) {
        const lowerWord = word.word.toLowerCase();
        const positions: number[] = [];

        if (word.match_type === 'exact') {
            // 精確匹配：需要匹配整個詞（前後有邊界）
            const regex = new RegExp(`\\b${escapeRegex(lowerWord)}\\b`, 'gi');
            let match;
            while ((match = regex.exec(lowerText)) !== null) {
                positions.push(match.index);
            }
        } else {
            // 模糊匹配：包含即可
            let pos = 0;
            while ((pos = lowerText.indexOf(lowerWord, pos)) !== -1) {
                positions.push(pos);
                pos += lowerWord.length;
            }
        }

        if (positions.length > 0) {
            matches.push({
                word: word.word,
                category: word.category,
                positions,
            });
        }
    }

    return {
        hasSensitive: matches.length > 0,
        matches,
    };
}

/**
 * 過濾文本中的敏感詞（替換為 ***）
 * @param text 待過濾文本
 * @param words 敏感詞列表
 * @returns 過濾後的文本
 */
export function filterSensitiveWords(
    text: string,
    words: SensitiveWord[] = defaultSensitiveWords
): string {
    let result = text;

    for (const word of words) {
        if (word.match_type === 'exact') {
            const regex = new RegExp(`\\b${escapeRegex(word.word)}\\b`, 'gi');
            result = result.replace(regex, '*'.repeat(word.word.length));
        } else {
            const regex = new RegExp(escapeRegex(word.word), 'gi');
            result = result.replace(regex, '*'.repeat(word.word.length));
        }
    }

    return result;
}

/**
 * 高亮文本中的敏感詞
 * @param text 待處理文本
 * @param words 敏感詞列表
 * @returns 帶 HTML 標記的文本
 */
export function highlightSensitiveWords(
    text: string,
    words: SensitiveWord[] = defaultSensitiveWords
): string {
    let result = text;

    for (const word of words) {
        const regex = new RegExp(escapeRegex(word.word), 'gi');
        result = result.replace(regex, `<mark class="bg-red-200 text-red-800">$&</mark>`);
    }

    return result;
}

/**
 * 轉義正則表達式特殊字符
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 獲取敏感詞類別標籤
 */
export function getCategoryLabel(category: SensitiveWord['category']): string {
    const labels: Record<string, string> = {
        political: '政治',
        adult: '成人',
        gambling: '賭博',
        fraud: '詐騙',
        violence: '暴力',
        other: '其他',
    };
    return labels[category] || '未知';
}
