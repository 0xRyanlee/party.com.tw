import { useState, useEffect } from 'react';

/**
 * Debounce hook - 延遲值更新以減少頻繁請求
 * @param value 要延遲的值
 * @param delay 延遲毫秒數（預設 500ms）
 * @returns 延遲後的值
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
