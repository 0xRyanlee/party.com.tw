/**
 * Event Schema - MVP Version
 * 最小可行產品版本，包含運行基本派對聚合平台所需的核心欄位
 */

// ==================== Core Types ====================

export type EventStatus = 'draft' | 'published' | 'closed' | 'canceled';

export type GenderLimit = 'none' | 'male_only' | 'female_only' | 'ratio_1_1';

export type VibeType =
    | 'relax'
    | 'networking'
    | 'dating'
    | 'hobby'
    | 'nightlife'
    | 'music'
    | 'sport';

export type CheckinType = 'qr' | 'name_list';

export type AttendeeListVisibility = 'public' | 'friends_only' | 'hidden';

export type QuestionnaireFieldType = 'text' | 'single_select' | 'multi_select';

// ==================== Sub-objects ====================

export interface TicketTypeMVP {
    ticketId: string;
    ticketName: string;
    description?: string;
    price: number;
    currency: string;
    stockTotal: number;
    stockRemaining: number;
    isRefundable: boolean;
    refundDeadline?: string; // ISO 8601
    checkinType: CheckinType;
}

export interface QuestionnaireField {
    fieldId: string;
    label: string;
    type: QuestionnaireFieldType;
    options?: string[];
    required: boolean;
}

// ==================== Main Event Object - MVP ====================

export interface EventMVP {
    // 1. Core
    eventId: string;
    title: string;
    subtitle?: string;
    coverImage: string;
    category: string;
    tags: string[];
    descriptionShort: string;
    descriptionLong: string;
    status: EventStatus;
    language: string;
    organizerId: string;
    organizerName: string;
    organizerAvatar?: string;
    organizerVerified: boolean;

    // 2. Time
    startTime: string; // ISO 8601
    endTime: string; // ISO 8601
    timezone: string; // e.g. "Asia/Taipei"

    // 3. Location
    venueName: string;
    address: string;
    city: string;
    country: string;
    gpsLat?: number;
    gpsLng?: number;

    // 4. Ticketing
    ticketTypes: TicketTypeMVP[];
    ticketSaleStart: string; // ISO 8601
    ticketSaleEnd: string; // ISO 8601
    allowWaitlist: boolean;

    // 5. Participant Constraints
    capacityTotal: number;
    capacityRemaining: number;
    genderLimit: GenderLimit;
    ageMin?: number;
    ageMax?: number;
    invitationOnly: boolean;
    requireQuestionnaire: boolean;
    questionnaireFields?: QuestionnaireField[];

    // 6. Vibe & Social
    vibeType: VibeType;
    theme?: string;
    moodTags: string[];
    eventRules?: string;
    allowComment: boolean;
    attendeeListVisibility: AttendeeListVisibility;

    // 7. Interaction (MVP)
    preEventChatroom: boolean;
    postEventChatroom: boolean;

    // 8. Post-event (MVP)
    ratingEnabled: boolean;
    attendeeRatingScore?: number;
    reviewCount?: number;

    // 9. System Admin
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}
