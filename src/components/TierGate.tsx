'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { getUserTier, canCreateEvent, hasFeatureAccess, UserTier } from '@/lib/tiers';
import UpgradeModal from '@/components/UpgradeModal';

interface TierGateProps {
    children: React.ReactNode;
    feature?: 'has_advanced_ticketing' | 'has_collaboration' | 'has_full_analytics';
    requireEventSlot?: boolean;
    fallback?: React.ReactNode;
    onBlock?: () => void;
}

/**
 * TierGate component that checks user tier permissions
 * Shows upgrade modal if user doesn't have access
 */
export default function TierGate({
    children,
    feature,
    requireEventSlot,
    fallback,
    onBlock,
}: TierGateProps) {
    const { user } = useUser();
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [currentTier, setCurrentTier] = useState<UserTier>('free');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [trigger, setTrigger] = useState<'event_limit' | 'capacity_limit' | 'feature_locked'>('feature_locked');

    useEffect(() => {
        if (!user) {
            setHasAccess(false);
            return;
        }

        checkAccess();
    }, [user, feature, requireEventSlot]);

    const checkAccess = async () => {
        if (!user) return;

        try {
            // Get user tier
            const tierInfo = await getUserTier(user.id);
            if (tierInfo) {
                setCurrentTier(tierInfo.tier);
            }

            // Check feature access
            if (feature) {
                const access = await hasFeatureAccess(user.id, feature);
                if (!access) {
                    setHasAccess(false);
                    setTrigger('feature_locked');
                    setShowUpgradeModal(true);
                    if (onBlock) onBlock();
                    return;
                }
            }

            // Check event slot availability
            if (requireEventSlot) {
                const canCreate = await canCreateEvent(user.id);
                if (!canCreate.allowed) {
                    setHasAccess(false);
                    setTrigger('event_limit');
                    setShowUpgradeModal(true);
                    if (onBlock) onBlock();
                    return;
                }
            }

            setHasAccess(true);
        } catch (error) {
            console.error('Tier gate check failed:', error);
            setHasAccess(false);
        }
    };

    const handleUpgrade = (newTier: UserTier) => {
        // Redirect to upgrade/payment page
        router.push(`/settings/upgrade?tier=${newTier}`);
    };

    if (hasAccess === null) {
        // Loading state
        return null;
    }

    if (!hasAccess) {
        return (
            <>
                {fallback || null}
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    currentTier={currentTier}
                    trigger={trigger}
                    onUpgrade={handleUpgrade}
                />
            </>
        );
    }

    return <>{children}</>;
}
