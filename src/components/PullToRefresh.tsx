'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    threshold?: number; // 觸發刷新的下拉距離
    className?: string;
}

export default function PullToRefresh({
    onRefresh,
    children,
    threshold = 80,
    className = '',
}: PullToRefreshProps) {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const currentY = useRef(0);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        // 只有在頁面頂部才啟用下拉刷新
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isPulling || isRefreshing) return;

        currentY.current = e.touches[0].clientY;
        const distance = currentY.current - startY.current;

        if (distance > 0) {
            // 阻尼效果
            const dampedDistance = Math.min(distance * 0.5, threshold * 1.5);
            setPullDistance(dampedDistance);

            // 防止頁面滾動
            if (distance > 10) {
                e.preventDefault();
            }
        }
    }, [isPulling, isRefreshing, threshold]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return;

        setIsPulling(false);

        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }

        setPullDistance(0);
    }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    const isReady = pullDistance >= threshold;
    const indicatorOpacity = Math.min(pullDistance / threshold, 1);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-auto ${className}`}
            style={{ touchAction: isPulling ? 'none' : 'auto' }}
        >
            {/* 下拉指示器 */}
            <div
                className="absolute left-0 right-0 flex items-center justify-center transition-transform duration-200 ease-out pointer-events-none z-10"
                style={{
                    height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
                    opacity: indicatorOpacity,
                }}
            >
                <div className={`
                    flex items-center justify-center gap-2 
                    ${isReady || isRefreshing ? 'text-black' : 'text-gray-400'}
                    transition-colors duration-200
                `}>
                    {isRefreshing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-medium">刷新中...</span>
                        </>
                    ) : (
                        <>
                            <ArrowDown
                                className={`w-5 h-5 transition-transform duration-200 ${isReady ? 'rotate-180' : ''}`}
                            />
                            <span className="text-sm font-medium">
                                {isReady ? '放開刷新' : '下拉刷新'}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* 內容區域 */}
            <div
                className="transition-transform duration-200 ease-out"
                style={{
                    transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`,
                }}
            >
                {children}
            </div>
        </div>
    );
}
