'use client';

import { useState, useEffect } from 'react';
import Picker from 'react-mobile-picker';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

interface DurationPickerProps {
    duration: number; // 分鐘
    onChange: (minutes: number) => void;
    className?: string;
}

// 預設選項（簡化為 1h, 2h）
const PRESET_DURATIONS = [
    { value: 60, label: '1h' },
    { value: 120, label: '2h' },
];

// 滾輪選項
const HOUR_OPTIONS = Array.from({ length: 13 }, (_, i) => i.toString()); // 0-12
const MINUTE_OPTIONS = ['00', '15', '30', '45'];

export default function DurationPicker({
    duration,
    onChange,
    className = '',
}: DurationPickerProps) {
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [pickerValue, setPickerValue] = useState({
        hours: Math.floor(duration / 60).toString(),
        minutes: (Math.floor((duration % 60) / 15) * 15).toString().padStart(2, '0'),
    });

    // 檢查是否為預設時長
    const isPreset = PRESET_DURATIONS.some(p => p.value === duration);
    const isCustom = !isPreset && duration !== 60 && duration !== 180;

    useEffect(() => {
        // 當 duration 變化時更新 picker 值
        setPickerValue({
            hours: Math.floor(duration / 60).toString(),
            minutes: (Math.floor((duration % 60) / 15) * 15).toString().padStart(2, '0'),
        });
    }, [duration]);

    const handlePresetClick = (minutes: number) => {
        onChange(minutes);
        setShowCustomPicker(false);
    };

    const handleCustomClick = () => {
        setShowCustomPicker(true);
    };

    const handlePickerChange = (value: { hours: string; minutes: string }) => {
        setPickerValue(value);
        const totalMinutes = parseInt(value.hours) * 60 + parseInt(value.minutes);
        onChange(totalMinutes || 60); // 最小 1 小時
    };

    // 格式化顯示時間
    const formatDuration = (minutes: number): string => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m} 分鐘`;
        if (m === 0) return `${h} 小時`;
        return `${h} 小時 ${m} 分鐘`;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-700" />
                <Label className="text-base font-semibold">活動時長</Label>
            </div>

            {/* 預設選項 */}
            <div className="flex gap-3">
                {PRESET_DURATIONS.map((preset) => (
                    <button
                        key={preset.value}
                        type="button"
                        onClick={() => handlePresetClick(preset.value)}
                        className={`flex-1 px-4 py-3 rounded-full font-medium transition-all ${duration === preset.value && !showCustomPicker
                            ? 'bg-black text-white'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                    >
                        {preset.label}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={handleCustomClick}
                    className={`flex-1 px-4 py-3 rounded-full font-medium transition-all ${showCustomPicker || isCustom
                        ? 'bg-black text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                >
                    自訂
                </button>
            </div>

            {/* 自訂滾輪選擇器 */}
            {(showCustomPicker || isCustom) && (
                <div className="bg-zinc-50 rounded-3xl p-4">
                    <div className="flex items-center justify-center">
                        <div className="w-full max-w-xs">
                            <Picker
                                value={pickerValue}
                                onChange={handlePickerChange}
                                wheelMode="normal"
                                height={160}
                            >
                                <Picker.Column name="hours">
                                    {HOUR_OPTIONS.map((hour) => (
                                        <Picker.Item key={hour} value={hour}>
                                            {({ selected }) => (
                                                <div
                                                    className={`text-center py-2 ${selected
                                                        ? 'text-black font-semibold text-xl'
                                                        : 'text-zinc-400 text-lg'
                                                        }`}
                                                >
                                                    {hour}
                                                </div>
                                            )}
                                        </Picker.Item>
                                    ))}
                                </Picker.Column>
                                <Picker.Column name="separator">
                                    <Picker.Item value=":">
                                        {() => (
                                            <div className="text-center py-2 text-black font-semibold text-xl">
                                                :
                                            </div>
                                        )}
                                    </Picker.Item>
                                </Picker.Column>
                                <Picker.Column name="minutes">
                                    {MINUTE_OPTIONS.map((minute) => (
                                        <Picker.Item key={minute} value={minute}>
                                            {({ selected }) => (
                                                <div
                                                    className={`text-center py-2 ${selected
                                                        ? 'text-black font-semibold text-xl'
                                                        : 'text-zinc-400 text-lg'
                                                        }`}
                                                >
                                                    {minute}
                                                </div>
                                            )}
                                        </Picker.Item>
                                    ))}
                                </Picker.Column>
                            </Picker>
                        </div>
                    </div>

                    {/* 時長顯示 */}
                    <p className="text-center text-sm text-zinc-500 mt-2">
                        結束時間：{formatDuration(duration)}後
                    </p>
                </div>
            )}
        </div>
    );
}
