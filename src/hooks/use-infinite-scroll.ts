import { useState, useEffect, useCallback } from 'react';

/**
 * 無限滾動 Hook
 */
export function useInfiniteScroll(
    callback: () => Promise<void>,
    options: {
        threshold?: number;
        enabled?: boolean;
    } = {}
) {
    const { threshold = 200, enabled = true } = options;
    const [loading, setLoading] = useState(false);

    const handleScroll = useCallback(async () => {
        if (!enabled || loading) return;

        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;

        if (docHeight - scrollTop - windowHeight < threshold) {
            setLoading(true);
            try {
                await callback();
            } finally {
                setLoading(false);
            }
        }
    }, [callback, enabled, loading, threshold]);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll, enabled]);

    return { loading };
}
