'use client';

import { Label } from '@/components/ui/label';
import { Bell, Mail, Smartphone } from 'lucide-react';

interface ReminderSettingsProps {
    reminderTimes: ('1day' | '1hour')[];
    reminderChannels: ('email' | 'push')[];
    onReminderTimesChange: (times: ('1day' | '1hour')[]) => void;
    onReminderChannelsChange: (channels: ('email' | 'push')[]) => void;
    className?: string;
}

const TIME_OPTIONS = [
    { value: '1day' as const, label: '提前 1 天' },
    { value: '1hour' as const, label: '提前 1 小時' },
];

const CHANNEL_OPTIONS = [
    { value: 'email' as const, label: '郵件通知', icon: Mail },
    { value: 'push' as const, label: '平台推送', icon: Smartphone },
];

export default function ReminderSettings({
    reminderTimes,
    reminderChannels,
    onReminderTimesChange,
    onReminderChannelsChange,
    className = '',
}: ReminderSettingsProps) {
    const toggleTime = (time: '1day' | '1hour') => {
        if (reminderTimes.includes(time)) {
            onReminderTimesChange(reminderTimes.filter(t => t !== time));
        } else {
            onReminderTimesChange([...reminderTimes, time]);
        }
    };

    const toggleChannel = (channel: 'email' | 'push') => {
        if (reminderChannels.includes(channel)) {
            onReminderChannelsChange(reminderChannels.filter(c => c !== channel));
        } else {
            onReminderChannelsChange([...reminderChannels, channel]);
        }
    };

    const hasReminders = reminderTimes.length > 0 && reminderChannels.length > 0;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-zinc-700" />
                <Label className="text-base font-semibold">提醒參加者</Label>
            </div>

            {/* 提醒時間 */}
            <div className="space-y-2">
                <p className="text-sm text-zinc-500">何時提醒</p>
                <div className="flex gap-3">
                    {TIME_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => toggleTime(option.value)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all ${reminderTimes.includes(option.value)
                                    ? 'border-black bg-black text-white'
                                    : 'border-zinc-200 hover:border-zinc-300'
                                }`}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${reminderTimes.includes(option.value)
                                    ? 'border-white bg-white'
                                    : 'border-zinc-400'
                                }`}>
                                {reminderTimes.includes(option.value) && (
                                    <div className="w-2 h-2 rounded-full bg-black" />
                                )}
                            </div>
                            <span className="font-medium text-sm">{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 通知方式 */}
            <div className="space-y-2">
                <p className="text-sm text-zinc-500">通知方式（可複選）</p>
                <div className="flex gap-3">
                    {CHANNEL_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => toggleChannel(option.value)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all ${reminderChannels.includes(option.value)
                                        ? 'border-black bg-black text-white'
                                        : 'border-zinc-200 hover:border-zinc-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="font-medium text-sm">{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 提示 */}
            {hasReminders && (
                <div className="bg-zinc-50 rounded-xl p-3">
                    <p className="text-xs text-zinc-600">
                        ✓ 系統將在活動開始前
                        {reminderTimes.includes('1day') && ' 1 天'}
                        {reminderTimes.includes('1day') && reminderTimes.includes('1hour') && ' 和'}
                        {reminderTimes.includes('1hour') && ' 1 小時'}
                        ，透過
                        {reminderChannels.includes('email') && ' 郵件'}
                        {reminderChannels.includes('email') && reminderChannels.includes('push') && ' 和'}
                        {reminderChannels.includes('push') && ' 平台推送'}
                        通知參加者
                    </p>
                </div>
            )}
        </div>
    );
}
