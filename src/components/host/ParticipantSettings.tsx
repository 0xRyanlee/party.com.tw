'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Users, Copy, RefreshCw, QrCode, Plus, Trash2, X, Check, AlertCircle } from 'lucide-react';
import QRCodeGenerator from '@/components/QRCodeGenerator';

interface InvitationChannel {
    id: string;
    name: string;
    code: string;
}

// 預設條件選項
const DEFAULT_REQUIREMENTS = [
    { id: 'free_entry', label: '可自由進場', labelEn: 'Free Entry' },
    { id: 'adult_only', label: '須年滿 18 歲', labelEn: '18+' },
    { id: 'bring_id', label: '請攜帶身分證件', labelEn: 'ID Required' },
    { id: 'dress_code', label: '有服裝要求', labelEn: 'Dress Code' },
];

interface ParticipantSettingsProps {
    capacityTotal?: number;
    isAdultOnly?: boolean;
    invitationOnly?: boolean;
    invitationCode?: string;
    requirements?: string[];
    onCapacityChange?: (capacity: number) => void;
    onAdultOnlyChange?: (isAdult: boolean) => void;
    onInvitationOnlyChange?: (invitationOnly: boolean) => void;
    onInvitationCodeChange?: (code: string) => void;
    onRequirementsChange?: (requirements: string[]) => void;
}

export default function ParticipantSettings({
    capacityTotal = 50,
    isAdultOnly = false,
    invitationOnly = false,
    invitationCode = '',
    requirements = [],
    onCapacityChange,
    onAdultOnlyChange,
    onInvitationOnlyChange,
    onInvitationCodeChange,
    onRequirementsChange,
}: ParticipantSettingsProps) {
    const [customCapacity, setCustomCapacity] = useState(capacityTotal);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [channels, setChannels] = useState<InvitationChannel[]>([
        { id: '1', name: 'Default', code: '' }
    ]);
    const [activeQRChannel, setActiveQRChannel] = useState<InvitationChannel | null>(null);
    const [customRequirement, setCustomRequirement] = useState('');

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

    const copyInvitationCode = (code: string) => {
        navigator.clipboard.writeText(code);
        alert('邀請碼已複製！');
    };

    const addChannel = () => {
        if (channels.length >= 3) return;
        const newId = String(Date.now());
        setChannels([...channels, { id: newId, name: '', code: '' }]);
    };

    const removeChannel = (id: string) => {
        setChannels(channels.filter(c => c.id !== id));
    };

    const updateChannelName = (id: string, name: string) => {
        setChannels(channels.map(c => c.id === id ? { ...c, name } : c));
    };

    const generateChannelCode = (id: string) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setChannels(channels.map(c => c.id === id ? { ...c, code } : c));
        // Also update primary invitation code for compatibility
        onInvitationCodeChange?.(code);
    };

    const getInvitationUrl = (code: string, channelName: string) => {
        if (typeof window === 'undefined') return '';
        return `${window.location.origin}/register?invite=${code}&ref=${encodeURIComponent(channelName)}`;
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
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">邀請通路設定 (最多 3 個)</Label>
                        {channels.length < 3 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={addChannel}
                                className="gap-1 text-xs"
                            >
                                <Plus className="w-3 h-3" />
                                新增通路
                            </Button>
                        )}
                    </div>

                    {/* Channel List */}
                    <div className="space-y-3">
                        {channels.map((channel, index) => (
                            <div key={channel.id} className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="text"
                                        value={channel.name}
                                        onChange={(e) => updateChannelName(channel.id, e.target.value)}
                                        placeholder={`通路名稱 (如: FB, IG, LINE)`}
                                        className="flex-1 text-sm"
                                    />
                                    {channels.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeChannel(channel.id)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 font-mono text-sm">
                                        {channel.code || <span className="text-gray-400">點擊生成邀請碼</span>}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => generateChannelCode(channel.id)}
                                        className="gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        生成
                                    </Button>
                                </div>

                                {channel.code && (
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyInvitationCode(channel.code)}
                                            className="flex-1 gap-1"
                                        >
                                            <Copy className="w-3 h-3" />
                                            複製碼
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setActiveQRChannel(channel)}
                                            className="flex-1 gap-1"
                                        >
                                            <QrCode className="w-3 h-3" />
                                            顯示 QR
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-gray-500">
                        提示：各通路的邀請碼可分別追蹤蛟換來源，方便分析行銷成效。
                    </p>
                </div>
            )}

            {/* 參與條件 */}
            <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-gray-700" />
                    <Label className="text-base font-semibold">參與條件</Label>
                </div>

                {/* 預設選項 */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    {DEFAULT_REQUIREMENTS.map((req) => {
                        const isSelected = requirements.includes(req.id);
                        return (
                            <button
                                key={req.id}
                                type="button"
                                onClick={() => {
                                    const newReqs = isSelected
                                        ? requirements.filter(r => r !== req.id)
                                        : [...requirements, req.id];
                                    onRequirementsChange?.(newReqs);
                                }}
                                className={`p-3 rounded-xl border-2 text-left transition-all text-sm ${isSelected
                                    ? 'border-black bg-black text-white'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    {isSelected && <Check className="w-4 h-4 shrink-0" />}
                                    <span className="font-medium">{req.label}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* 自訂條件 */}
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            value={customRequirement}
                            onChange={(e) => setCustomRequirement(e.target.value)}
                            placeholder="自訂條件，如「請自備餐點」"
                            className="flex-1 text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (customRequirement.trim()) {
                                        onRequirementsChange?.([...requirements, customRequirement.trim()]);
                                        setCustomRequirement('');
                                    }
                                }
                            }}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (customRequirement.trim()) {
                                    onRequirementsChange?.([...requirements, customRequirement.trim()]);
                                    setCustomRequirement('');
                                }
                            }}
                            className="gap-1"
                        >
                            <Plus className="w-3 h-3" />
                            新增
                        </Button>
                    </div>

                    {/* 已新增的自訂條件（非預設選項） */}
                    {requirements.filter(r => !DEFAULT_REQUIREMENTS.find(d => d.id === r)).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {requirements.filter(r => !DEFAULT_REQUIREMENTS.find(d => d.id === r)).map((req, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm"
                                >
                                    {req}
                                    <button
                                        type="button"
                                        onClick={() => onRequirementsChange?.(requirements.filter(r => r !== req))}
                                        className="hover:text-amber-900"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* QR Code Modal */}
            {activeQRChannel && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setActiveQRChannel(null)}>
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">邀請 QR Code</h3>
                            <Button variant="ghost" size="icon" onClick={() => setActiveQRChannel(null)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <QRCodeGenerator
                            value={getInvitationUrl(activeQRChannel.code, activeQRChannel.name)}
                            type="promotion"
                            label={activeQRChannel.name || '預設通路'}
                            defaultErrorLevel="Q"
                            allowErrorLevelChange={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
