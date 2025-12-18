'use client';

/**
 * Skeleton 骨架屏組件 - 頁面載入時的佔位符
 */

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
    );
}

// 卡片骨架屏
export function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            {/* 圖片佔位 */}
            <Skeleton className="h-48 w-full rounded-none" />

            <div className="p-4 space-y-3">
                {/* 標題 */}
                <Skeleton className="h-5 w-3/4" />

                {/* 副標題 */}
                <Skeleton className="h-4 w-1/2" />

                {/* 描述 */}
                <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                </div>

                {/* 標籤 */}
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// 活動卡片骨架屏（網格）
export function SkeletonEventGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

// 列表項骨架屏
export function SkeletonListItem() {
    return (
        <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
            {/* 頭像/圖片 */}
            <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />

            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}

// 用戶資料骨架屏
export function SkeletonProfile() {
    return (
        <div className="space-y-6 p-6">
            {/* 頭像區域 */}
            <div className="flex items-center gap-4">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>

            {/* 統計區域 */}
            <div className="flex gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center space-y-1">
                        <Skeleton className="h-8 w-12 mx-auto" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// 表單骨架屏
export function SkeletonForm() {
    return (
        <div className="space-y-4 p-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                </div>
            ))}
            <Skeleton className="h-12 w-full rounded-full mt-6" />
        </div>
    );
}
