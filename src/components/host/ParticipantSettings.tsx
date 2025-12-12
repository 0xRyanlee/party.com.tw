'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Users, Copy, RefreshCw, QrCode } from 'lucide-react';

interface ParticipantSettingsProps {
    capacityTotal?: number;
    isAdultOnly?: boolean;
    invitationOnly?: boolean;
    invitationCode?: string;
    onCapacityChange?: (capacity: number) => void;
    onAdultOnlyChange?: (isAdult: boolean) => void;
    onInvitationOnlyChange?: (invitationOnly: boolean) => void;
    onInvitationCodeChange?: (code: string) => void;
}

export default function ParticipantSettings({
    capacityTotal = 50,
    isAdultOnly = false,
    invitationOnly = false,
    invitationCode = '',
    onCapacityChange,
    onAdultOnlyChange,
    onInvitationOnlyChange,
    onInvitationCodeChange,
}: ParticipantSettingsProps) {
    const [customCapacity, setCustomCapacity] = useState(capacityTotal);
    const [showCustomInput, setShowCustomInput] = useState(false);

    const quickCapacities = [20, 50];

    const handleCapacityClick = (cap: number) => {
        setCustomCapacity(cap);
        setShowCustomInput(false);
        onCapacityChange?.(cap);
    };

    const handleCustomCapacity = (value: string) => {
        const num = parseInt(value);
        if (!isNaN(num) && num > 0) {
            setCustomCapacity(num);
            onCapacityChange?.(num);
        }
    };

    const generateInvitationCode = () => {
        // 生成 8 位隨機邀請碼
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        onInvitationCodeChange?.(code);
    };

    const copyInvitationCode = () => {
        if (invitationCode) {
            navigator.clipboard.writeText(invitationCode);
            alert('邀請碼已複製！');
        }
    };

    return (
        <div className="space-y-6">
            {/* 活動人數 */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-gray-700" />
                    <Label className="text-base font-semibold">活動人數上限</Label>
                </div>

                {/* 快捷選擇 - 簡化為 20/50/自定義 */}
                <div className="flex gap-2 mb-3">
                    {quickCapacities.map((cap) => (
                        <button
                            key={cap}
                            type="button"
                            onClick={() => handleCapacityClick(cap)}
                            className={`flex-1 px-4 py-3 rounded-full border-2 text-sm font-medium transition-all ${customCapacity === cap && !showCustomInput
                                ? 'border-black bg-black text-white'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {cap}人
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setShowCustomInput(true)}
                        className={`flex-1 px-4 py-3 rounded-full border-2 text-sm font-medium transition-all ${showCustomInput
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        自定義
                    </button>
                </div>

                {/* 自定義輸入 - 只在選擇自定義時顯示 */}
                {showCustomInput && (
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            value={customCapacity}
                            onChange={(e) => handleCustomCapacity(e.target.value)}
                            placeholder="輸入人數"
                            className="flex-1"
                            min={1}
                        />
                        <div className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">
                            {customCapacity} 人
                        </div>
                    </div>
                )}
            </div>

            {/* 18+ 和 邀請制 並排卡片 */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => onAdultOnlyChange?.(!isAdultOnly)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${isAdultOnly
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                >
                    <div className="text-lg font-bold mb-1">18+</div>
                    <div className={`text-xs ${isAdultOnly ? 'text-gray-300' : 'text-gray-500'}`}>成人限定</div>
                </button>

                <button
                    type="button"
                    onClick={() => onInvitationOnlyChange?.(!invitationOnly)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${invitationOnly
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                >
                    <div className="text-lg font-bold mb-1">邀請制</div>
                    <div className={`text-xs ${invitationOnly ? 'text-gray-300' : 'text-gray-500'}`}>需邀請碼</div>
                </button>
            </div>

            {/* 邀請碼管理 - 只在邀請制開啟時顯示 */}
            {invitationOnly && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 space-y-3">
                    <Label className="text-sm font-medium text-gray-700">邀請碼設定</Label>

                    {/* 邀請碼輸入 */}
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            value={invitationCode}
                            onChange={(e) => onInvitationCodeChange?.(e.target.value.toUpperCase())}
                            placeholder="輸入自定義邀請碼"
                            className="flex-1 uppercase"
                            maxLength={12}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={generateInvitationCode}
                            className="gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            自動生成
                        </Button>
                    </div>

                    {/* 邀請碼顯示與操作 */}
                    {invitationCode && (
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">當前邀請碼</p>
                                    <p className="text-2xl font-bold tracking-wider font-mono">
                                        {invitationCode}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={copyInvitationCode}
                                        className="gap-2"
                                    >
                                        <Copy className="w-3 h-3" />
                                        複製
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <QrCode className="w-3 h-3" />
                                        QR Code
                                    </Button>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500">
                                提示：參與者需輸入此邀請碼才能報名。您可以隨時更改邀請碼。
                            </p>
                        </div>
                    )}

                    {!invitationCode && (
                        <p className="text-xs text-gray-500 text-center py-2">
                            請輸入或生成邀請碼
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
