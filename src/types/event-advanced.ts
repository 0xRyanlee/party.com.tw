/**
 * Event Schema - Advanced Version
 * 完整版本，包含所有進階維度和商業化功能
 */

import {
    EventStatus,
    GenderLimit,
    VibeType,
    QuestionnaireField
} from './event-mvp';

// ==================== Advanced Types ====================

export type CheckinTypeAdvanced = 'qr' | 'nfc' | 'name_list';

export type IdentityVerificationLevel = 'none' | 'phone' | 'email' | 'gov_id';

export type GroupMatchingMode = 'none' | 'random_pair' | 'interest_based';

export type ReviewVisibility = 'public' | 'private';

export type SponsorTier = 'title' | 'gold' | 'silver' | 'bronze';

export type InvoiceType = 'electronic' | 'receipt' | 'none';

export type RiskLevel = 'low' | 'medium' | 'high';

export type DiscountType = 'amount' | 'percent';

export type SurveyFieldType = 'rating' | 'text' | 'single_select' | 'multi_select';

// ==================== Sub-objects (Advanced) ====================

export interface TicketTypeAdvanced {
    ticketId: string;
    ticketName: string;
    description?: string;
    price: number;
    currency: string;
    originalPrice?: number;
    discountRate?: number; // 0-1
    stockTotal: number;
    stockRemaining: number;
    minPurchase?: number;
    maxPurchase?: number;
    refundPolicyId?: string;
    refundDeadline?: string; // ISO 8601
    isRefundable: boolean;
    transferable?: boolean;
    checkinType: CheckinTypeAdvanced;
}

export interface Task {
    taskId: string;
    title: string;
    description?: string;
    rewardType?: string;
}

export interface Poll {
    pollId: string;
    question: string;
    options: string[];
    multiSelect: boolean;
}

export interface PostEventPhoto {
    photoId: string;
    url: string;
    uploaderId: string;
}

export interface PostEventSurveyQuestion {
    questionId: string;
    question: string;
    type: SurveyFieldType;
    options?: string[];
}

export interface Sponsor {
    sponsorId?: string;
    name: string;
    logo?: string;
    description?: string;
    tier?: SponsorTier;
}

export interface Booth {
    boothId: string;
    name: string;
    price: number;
    description?: string;
}

export interface MerchItem {
    merchId: string;
    name: string;
    price: number;
    currency: string;
    stockTotal?: number;
}

export interface FnBPackage {
    packageId: string;
    name: string;
    price: number;
}

export interface UpsellItem {
    itemId: string;
    name: string;
    price: number;
}

export interface PromoCode {
    code: string;
    discountType: DiscountType;
    value: number;
    usageLimit?: number;
}

export interface RegistrationCustomField {
    fieldId: string;
    label: string;
    type: 'text' | 'single_select' | 'multi_select';
    required: boolean;
}

export interface Speaker {
    speakerId?: string;
    name: string;
    title?: string;
    avatar?: string;
    bio?: string;
}

export interface AgendaItem {
    agendaId: string;
    title: string;
    startTime: string; // ISO 8601
    endTime: string; // ISO 8601
    description?: string;
}

// ==================== Main Event Object - Advanced ====================

export interface EventAdvanced {
    // 1. Core
    eventId: string;
    title: string;
    subtitle?: string;
    coverImage: string;
    galleryImages?: string[];
    category: string;
    tags: string[];
    descriptionLong: string;
    descriptionShort: string;
    organizerId: string;
    organizerName: string;
    organizerAvatar?: string;
    organizerVerified: boolean;
    status: EventStatus;
    language: string;
    nsfwFlag: boolean;

    // 2. Time
    startTime: string; // ISO 8601
    endTime: string; // ISO 8601
    timezone: string;
    recurringRule?: string; // iCal / RRULE
    checkinTime?: string; // ISO 8601
    entranceCloseTime?: string; // ISO 8601
    eventDuration?: number; // 分鐘

    // 3. Venue / Location
    venueId?: string;
    venueName: string;
    address: string;
    addressDetail?: string;
    district?: string;
    city: string;
    region?: string;
    country: string;
    gpsLat?: number;
    gpsLng?: number;
    googleMapsLink?: string;
    transportationInfo?: string;
    parkingInfo?: string;
    indoor: boolean;
    venueCapacity?: number;

    // 4. Ticketing (Advanced)
    ticketTypes: TicketTypeAdvanced[];
    ticketSaleStart: string; // ISO 8601
    ticketSaleEnd: string; // ISO 8601
    allowWaitlist: boolean;
    serviceFeeRate?: number;
    taxRate?: number;
    invoiceType?: InvoiceType;

    // 5. Participant Attributes
    capacityTotal: number;
    capacityRemaining: number;
    genderLimit: GenderLimit;
    genderRatioRule?: string;
    ageMin?: number;
    ageMax?: number;
    identityVerificationLevel: IdentityVerificationLevel;
    dressCode?: string;
    requiredItemsList?: string[];
    invitationOnly: boolean;
    requireQuestionnaire: boolean;
    questionnaireFields?: QuestionnaireField[];

    // 6. Vibe & Social
    vibeType: VibeType | string;
    theme?: string;
    moodTags: string[];
    eventRules?: string;
    behaviorGuidelines?: string;
    allowComment: boolean;
    allowUserGeneratedAlbum: boolean;
    attendeeListVisibility: 'public' | 'friends_only' | 'hidden';

    // 7. Interaction
    preEventChatroom: boolean;
    postEventChatroom: boolean;
    announcementBoard: boolean;
    groupMatchingMode: GroupMatchingMode;
    badgeReward: boolean;
    tasks?: Task[];
    polls?: Poll[];

    // 8. Post-event
    ratingEnabled: boolean;
    attendeeRatingScore?: number;
    organizerRatingScore?: number;
    reviewCount?: number;
    reviewVisibility?: ReviewVisibility;
    postEventAlbum?: PostEventPhoto[];
    postEventSurvey?: PostEventSurveyQuestion[];

    // 9. Sponsor / Business
    sponsorList?: Sponsor[];
    brandExposureOptions?: string[];
    boothAvailable: boolean;
    boothList?: Booth[];
    collaborationContractId?: string;

    // 10. Monetization Add-ons
    merchItems?: MerchItem[];
    fnbPackages?: FnBPackage[];
    upsellItems?: UpsellItem[];
    addOnInsurance: boolean;
    addOnPhotography: boolean;

    // 11. Safety / Legal
    ageRestricted: boolean;
    alcoholAllowed: boolean;
    safetyNotice?: string;
    disclaimerText?: string;
    photographyConsentRequired: boolean;
    emergencyContact?: string;
    securityLevel?: string;
    insuranceProvider?: string;
    liabilityWaiverId?: string;

    // 12. Admin / Internal
    eventCode?: string;
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
    createdBy: string;
    updatedBy: string;
    adminNotes?: string;
    riskLevel?: RiskLevel;
    manualReviewRequired: boolean;
    fraudDetectionScore?: number;

    // 13. Algo / Recommendation
    popularityScore?: number;
    trendingScore?: number;
    conversionRate?: number;
    clickThroughRate?: number;
    reEngagementScore?: number;
    categoryWeight?: number;
    geoDistanceScore?: number;
    affinityScore?: number;
    eventSimilarityKeys?: string[];
    tagsEmbeddingVector?: number[];

    // 14. Marketing
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    socialShareTitle?: string;
    socialShareImage?: string;
    ugcHashtag?: string;
    emailTemplateId?: string;
    pushCampaignId?: string;
    promoCodeList?: PromoCode[];
    partnershipChannel?: string[];

    // 15. Business Event Extensions
    companyId?: string;
    ndaRequired?: boolean;
    registrationFormCustomFields?: RegistrationCustomField[];
    certificateOfAttendance?: boolean;
    speakerList?: Speaker[];
    agendaItems?: AgendaItem[];
    sponsorTierOverall?: SponsorTier;

    // 16. Tech / System
    schemaVersion?: string;
    apiVersion?: string;
    cacheTtl?: number;
    cdnResources?: string[];
    analyticsEventId?: string;
    logStreamId?: string;
}
