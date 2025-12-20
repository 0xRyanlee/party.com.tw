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

// Club 卡片骨架屏
export function SkeletonClubCard() {
    return (
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 p-4">
            <div className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Club 列表骨架屏
export function SkeletonClubList({ count = 4 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonClubCard key={i} />
            ))}
        </div>
    );
}

// 聊天訊息骨架屏
export function SkeletonChatMessage({ isOwn = false }: { isOwn?: boolean }) {
    return (
        <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className={`space-y-1 ${isOwn ? 'items-end' : ''}`}>
                <Skeleton className="h-3 w-20" />
                <Skeleton className={`h-12 ${isOwn ? 'w-40' : 'w-48'} rounded-2xl`} />
            </div>
        </div>
    );
}

// 聊天室骨架屏
export function SkeletonChatRoom() {
    return (
        <div className="space-y-4 p-4">
            <SkeletonChatMessage />
            <SkeletonChatMessage isOwn />
            <SkeletonChatMessage />
            <SkeletonChatMessage />
            <SkeletonChatMessage isOwn />
        </div>
    );
}

// 討論串骨架屏
export function SkeletonDiscussion() {
    return (
        <div className="bg-white rounded-2xl p-4 space-y-3 border border-gray-100">
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-4 pt-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
            </div>
        </div>
    );
}

// 票券骨架屏
export function SkeletonTicket() {
    return (
        <div className="bg-white rounded-3xl p-4 border border-gray-100 flex gap-4">
            <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// 票夾骨架屏
export function SkeletonTicketList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonTicket key={i} />
            ))}
        </div>
    );
}

// Hero 區塊骨架屏
export function SkeletonHero() {
    return (
        <div className="relative h-[50vh] bg-gray-200 animate-pulse rounded-3xl overflow-hidden">
            <div className="absolute bottom-8 left-8 right-8 space-y-4">
                <Skeleton className="h-10 w-2/3 bg-gray-300" />
                <Skeleton className="h-6 w-1/2 bg-gray-300" />
                <div className="flex gap-3">
                    <Skeleton className="h-12 w-32 rounded-full bg-gray-300" />
                    <Skeleton className="h-12 w-12 rounded-full bg-gray-300" />
                </div>
            </div>
        </div>
    );
}

// Vendor 詳情骨架屏
export function SkeletonVendorDetail() {
    return (
        <div className="space-y-8">
            <SkeletonHero />
            <div className="grid lg:grid-cols-12 gap-8 px-6">
                <div className="lg:col-span-8 space-y-6">
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-24 rounded-3xl" />
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-4 space-y-4">
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                </div>
            </div>
        </div>
    );
}

// 統計卡片骨架屏
export function SkeletonStatCard() {
    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
        </div>
    );
}

// 統計區塊骨架屏
export function SkeletonStats({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonStatCard key={i} />
            ))}
        </div>
    );
}
