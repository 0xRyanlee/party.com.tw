import { createClient } from '@/lib/supabase/server';

export type UserTier = 'free' | 'plus' | 'pro';

export interface TierLimits {
    max_events: number;
    max_capacity: number;
    has_advanced_ticketing: boolean;
    has_collaboration: boolean;
    has_full_analytics: boolean;
}

export interface UserTierInfo {
    tier: UserTier;
    subscription_status: string | null;
    subscription_end_date: string | null;
    events_created_this_month: number;
}

const TIER_LIMITS: Record<UserTier, TierLimits> = {
    free: {
        max_events: 1,
        max_capacity: 50,
        has_advanced_ticketing: false,
        has_collaboration: false,
        has_full_analytics: false,
    },
    plus: {
        max_events: 5,
        max_capacity: 500,
        has_advanced_ticketing: true,
        has_collaboration: true,
        has_full_analytics: true,
    },
    pro: {
        max_events: 999,
        max_capacity: 9999,
        has_advanced_ticketing: true,
        has_collaboration: true,
        has_full_analytics: true,
    },
};

/**
 * Get user's current tier information
 */
export async function getUserTier(userId: string): Promise<UserTierInfo | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('user_tiers')
        .select('tier, subscription_status, subscription_end_date, events_created_this_month')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        // Return default free tier if not found
        return {
            tier: 'free',
            subscription_status: null,
            subscription_end_date: null,
            events_created_this_month: 0,
        };
    }

    return data as UserTierInfo;
}

/**
 * Get tier limits for a specific tier
 */
export function getTierLimits(tier: UserTier): TierLimits {
    return TIER_LIMITS[tier];
}

/**
 * Check if user can create a new event
 */
export async function canCreateEvent(userId: string): Promise<{
    allowed: boolean;
    reason?: 'tier_limit' | 'monthly_limit';
    current_count?: number;
    limit?: number;
}> {
    const supabase = await createClient();

    // Get user tier
    const tierInfo = await getUserTier(userId);
    if (!tierInfo) {
        return {
            allowed: false,
            reason: 'tier_limit',
        };
    }

    const limits = getTierLimits(tierInfo.tier);

    // Count active events
    const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', userId)
        .not('status', 'in', '(cancelled,completed,archived)');

    if (error) {
        throw error;
    }

    const activeEventsCount = count || 0;

    if (activeEventsCount >= limits.max_events) {
        return {
            allowed: false,
            reason: 'tier_limit',
            current_count: activeEventsCount,
            limit: limits.max_events,
        };
    }

    return {
        allowed: true,
        current_count: activeEventsCount,
        limit: limits.max_events,
    };
}

/**
 * Check if event capacity is within user's tier limit
 */
export async function validateEventCapacity(
    userId: string,
    capacity: number
): Promise<{ valid: boolean; max_capacity?: number }> {
    const tierInfo = await getUserTier(userId);
    if (!tierInfo) {
        return { valid: false };
    }

    const limits = getTierLimits(tierInfo.tier);

    return {
        valid: capacity <= limits.max_capacity,
        max_capacity: limits.max_capacity,
    };
}

/**
 * Check if user has access to advanced features
 */
export async function hasFeatureAccess(
    userId: string,
    feature: keyof Omit<TierLimits, 'max_events' | 'max_capacity'>
): Promise<boolean> {
    const tierInfo = await getUserTier(userId);
    if (!tierInfo) {
        return false;
    }

    const limits = getTierLimits(tierInfo.tier);
    return limits[feature];
}

/**
 * Upgrade user tier
 */
export async function upgradeTier(
    userId: string,
    newTier: UserTier,
    subscriptionData?: {
        subscription_id: string;
        subscription_status: string;
        subscription_start_date: string;
        subscription_end_date?: string;
    }
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const updateData: any = {
        tier: newTier,
        updated_at: new Date().toISOString(),
    };

    if (subscriptionData) {
        updateData.subscription_id = subscriptionData.subscription_id;
        updateData.subscription_status = subscriptionData.subscription_status;
        updateData.subscription_start_date = subscriptionData.subscription_start_date;
        if (subscriptionData.subscription_end_date) {
            updateData.subscription_end_date = subscriptionData.subscription_end_date;
        }
    }

    const { error } = await supabase
        .from('user_tiers')
        .update(updateData)
        .eq('user_id', userId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
