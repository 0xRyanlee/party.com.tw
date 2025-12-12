'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, Sparkles, TrendingUp } from 'lucide-react';
import { UserTier } from '@/lib/tiers';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTier: UserTier;
    trigger: 'event_limit' | 'capacity_limit' | 'feature_locked';
    onUpgrade?: (tier: UserTier) => void;
}

const TIER_FEATURES = {
    free: {
        name: 'Free',
        price: '$0',
        period: '',
        events: '1 場活動',
        capacity: '50 人',
        features: [
            { name: '基礎票務管理', included: true },
            { name: '活動數據（基本）', included: true },
            { name: '進階票務功能', included: false },
            { name: '合作招募', included: false },
            { name: '完整數據報表', included: false },
            { name: '優先推薦', included: false },
        ],
    },
    plus: {
        name: 'Plus',
        price: '$29',
        period: '/月',
        events: '5 場活動',
        capacity: '500 人',
        features: [
            { name: '基礎票務管理', included: true },
            { name: '活動數據（基本）', included: true },
            { name: '進階票務功能', included: true },
            { name: '合作招募', included: true },
            { name: '完整數據報表', included: true },
            { name: '優先推薦', included: true },
        ],
    },
    pro: {
        name: 'Pro',
        price: '$99',
        period: '/月',
        events: '無限制',
        capacity: '無限制',
        features: [
            { name: '所有 Plus 功能', included: true },
            { name: 'API 存取', included: true },
            { name: '專屬客戶經理', included: true },
            { name: '白標客製化', included: true },
            { name: '優先技術支援', included: true },
        ],
    },
};

const TRIGGER_MESSAGES = {
    event_limit: {
        title: '活動數量已達上限',
        description: '您的當前方案已達活動上限。升級以建立更多活動！',
    },
    capacity_limit: {
        title: '人數超過上限',
        description: '您的當前方案人數上限為 {limit} 人。升級以容納更多參與者！',
    },
    feature_locked: {
        title: '此功能需要升級',
        description: '此功能僅限 Plus 以上會員使用。立即升級解鎖完整功能！',
    },
};

export default function UpgradeModal({
    isOpen,
    onClose,
    currentTier,
    trigger,
    onUpgrade,
}: UpgradeModalProps) {
    const [selectedTier, setSelectedTier] = useState<UserTier>(
        currentTier === 'free' ? 'plus' : 'pro'
    );
    const [loading, setLoading] = useState(false);

    const triggerMessage = TRIGGER_MESSAGES[trigger];
    const recommended = currentTier === 'free' ? 'plus' : 'pro';

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            if (onUpgrade) {
                await onUpgrade(selectedTier);
            }
            onClose();
        } catch (error) {
            console.error('Upgrade failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-gray-700" />
                        <DialogTitle className="text-2xl font-bold">{triggerMessage.title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        {triggerMessage.description}
                    </DialogDescription>
                </DialogHeader>

                {/* Tier Comparison */}
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                    {(['free', 'plus', 'pro'] as UserTier[]).map((tier) => {
                        const tierData = TIER_FEATURES[tier];
                        const isCurrentTier = tier === currentTier;
                        const isRecommended = tier === recommended;
                        const isSelected = tier === selectedTier;

                        return (
                            <div
                                key={tier}
                                className={`
                                    relative rounded-2xl border-2 p-6 transition-all cursor-pointer
                                    ${isSelected
                                        ? 'border-black bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }
                                    ${isCurrentTier ? 'opacity-60' : ''}
                                `}
                                onClick={() => !isCurrentTier && setSelectedTier(tier)}
                            >
                                {/* Recommended Badge */}
                                {isRecommended && !isCurrentTier && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <div className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            推薦
                                        </div>
                                    </div>
                                )}

                                {/* Current Tier Badge */}
                                {isCurrentTier && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <div className="bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            當前方案
                                        </div>
                                    </div>
                                )}

                                {/* Tier Name */}
                                <h3 className="text-xl font-bold mb-2">{tierData.name}</h3>

                                {/* Price */}
                                <div className="mb-4">
                                    <span className="text-3xl font-bold">{tierData.price}</span>
                                    <span className="text-gray-500">{tierData.period}</span>
                                </div>

                                {/* Limits */}
                                <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                                    <div className="text-sm">
                                        <span className="font-medium">同時活動：</span>
                                        <span className="text-gray-600"> {tierData.events}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-medium">人數上限：</span>
                                        <span className="text-gray-600"> {tierData.capacity}</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-2.5">
                                    {tierData.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                            {feature.included ? (
                                                <Check className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                                            ) : (
                                                <X className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                                            )}
                                            <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                                                {feature.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Select Button */}
                                {!isCurrentTier && (
                                    <Button
                                        className={`w-full mt-6 rounded-full ${isSelected
                                                ? 'bg-black text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        onClick={() => setSelectedTier(tier)}
                                    >
                                        {isSelected ? '已選擇' : '選擇方案'}
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                    <Button variant="outline" onClick={onClose} className="rounded-full">
                        稍後再說
                    </Button>
                    <Button
                        onClick={handleUpgrade}
                        disabled={loading || selectedTier === currentTier}
                        className="rounded-full bg-black text-white hover:bg-gray-800 px-6"
                    >
                        {loading ? '處理中...' : `升級至 ${TIER_FEATURES[selectedTier].name}`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
