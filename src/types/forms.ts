/**
 * 統一表單類型定義
 * 用於替換 any 類型
 */

// ============================================
// 活動相關類型
// ============================================

export interface TicketType {
    id?: string;
    name: string;
    price: number;
    quantity: number;
    description?: string;
    salesStart?: string;
    salesEnd?: string;
    minPerOrder?: number;
    maxPerOrder?: number;
}

export interface EventFormData {
    title: string;
    subtitle?: string;
    descriptionShort?: string;
    descriptionLong: string;
    category: string;
    coverImage?: string;

    // 時間
    startTime: string;
    endTime: string;
    timezone?: string;

    // 地點
    venueName: string;
    address: string;
    city?: string;
    country?: string;
    gpsLat?: number;
    gpsLng?: number;

    // 票務
    ticketTypes: TicketType[];
    capacityTotal?: number;
    allowWaitlist?: boolean;

    // 設定
    isAdultOnly?: boolean;
    invitationOnly?: boolean;
    invitationCode?: string;

    // 標籤
    tags: string[];

    // 狀態
    status?: 'draft' | 'published' | 'cancelled';
}

// ============================================
// 用戶相關類型
// ============================================

export interface UserProfile {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
    tier?: 'free' | 'pro' | 'ultra';
    createdAt?: string;
}

// ============================================
// 評價相關類型
// ============================================

export interface ReviewData {
    id?: string;
    rating: number;
    title?: string;
    content?: string;
    isAnonymous: boolean;
    reviewerName?: string;
    reviewerAvatar?: string;
    helpfulCount?: number;
    createdAt?: string;
}

// ============================================
// 報告相關類型
// ============================================

export type ReportType = 'report' | 'feedback' | 'collaboration';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'rejected';

export interface ReportData {
    id?: string;
    reportType: ReportType;
    category: string;
    content: string;
    contactEmail?: string;
    status?: ReportStatus;
    createdAt?: string;
}

// ============================================
// API 響應類型
// ============================================

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
