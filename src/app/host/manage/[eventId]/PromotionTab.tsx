'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Plus,
    Trash2,
    Copy,
    QrCode,
    TrendingUp,
    MousePointer,
    UserCheck,
    Percent,
    RefreshCw,
    ExternalLink,
    Info,
    Loader2,
    X
} from 'lucide-react';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { createClient } from '@/lib/supabase/client';

interface ShareChannel {
    id: string;
    name: string;
    code: string;
    clicks: number;
    registrations: number;
    cvr: number;
}

interface PromotionTabProps {
    eventId: string;
    eventTitle: string;
}

export default function PromotionTab({ eventId, eventTitle }: PromotionTabProps) {
    const supabase = createClient();
    const [channels, setChannels] = useState<ShareChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [newChannelName, setNewChannelName] = useState('');
    const [adding, setAdding] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<ShareChannel | null>(null);

    useEffect(() => {
        fetchChannels();
    }, [eventId]);

    const fetchChannels = async () => {
        try {
            const { data, error } = await supabase
                .from('share_channel_analytics')
                .select('*')
                .eq('event_id', eventId);

            if (error) throw error;

            const transformedChannels: ShareChannel[] = (data || []).map((ch: any) => ({
                id: ch.channel_id,
                name: ch.channel_name,
                code: ch.code,
                clicks: ch.total_clicks || 0,
                registrations: ch.registrations || 0,
                cvr: ch.total_clicks > 0
                    ? Math.round((ch.registrations / ch.total_clicks) * 100)
                    : 0,
            }));

            setChannels(transformedChannels);
        } catch (error) {
            console.error('Error fetching channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const addChannel = async () => {
        if (!newChannelName.trim() || channels.length >= 3) return;

        setAdding(true);
        try {
            const code = generateCode();
            const { error } = await supabase
                .from('share_channels')
                .insert({
                    event_id: eventId,
                    name: newChannelName.trim(),
                    code,
                });

            if (error) throw error;

            await fetchChannels();
            setNewChannelName('');
        } catch (error) {
            console.error('Error adding channel:', error);
        } finally {
            setAdding(false);
        }
    };

    const deleteChannel = async (channelId: string) => {
        if (!confirm('確定要刪除此通路嗎？相關的追蹤數據將一併刪除。')) return;

        try {
            const { error } = await supabase
                .from('share_channels')
                .delete()
                .eq('id', channelId);

            if (error) throw error;

            await fetchChannels();
        } catch (error) {
            console.error('Error deleting channel:', error);
        }
    };

    const copyLink = (channel: ShareChannel) => {
        const url = getChannelUrl(channel);
        navigator.clipboard.writeText(url);
        alert('連結已複製！');
    };

    const getChannelUrl = (channel: ShareChannel) => {
        if (typeof window === 'undefined') return '';
        return `${window.location.origin}/events/${eventId}?ref=${channel.code}`;
    };

    const totalClicks = channels.reduce((sum, ch) => sum + ch.clicks, 0);
    const totalRegistrations = channels.reduce((sum, ch) => sum + ch.registrations, 0);
    const overallCvr = totalClicks > 0 ? Math.round((totalRegistrations / totalClicks) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500 font-medium">總點擊數</span>
                        <MousePointer className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight text-neutral-900">{totalClicks}</div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500 font-medium">總轉化數</span>
                        <UserCheck className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight text-neutral-900">{totalRegistrations}</div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500 font-medium">整體轉化率</span>
                        <Percent className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight text-neutral-900">{overallCvr}%</div>
                </div>
            </div>

            {/* Channel List */}
            <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg">分享通路追蹤</h3>
                        <p className="text-sm text-gray-500">建立不同通路的專屬連結，追蹤行銷成效</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchChannels}
                        className="rounded-full gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        刷新
                    </Button>
                </div>

                {/* Hint */}
                <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">通路命名建議</p>
                        <ul className="text-blue-600 space-y-1">
                            <li>• 按推廣形式：海報、台卡、邀請函</li>
                            <li>• 按渠道類型：社媒、地推、官網</li>
                            <li>• 按平台名稱：Facebook、Instagram、LINE</li>
                        </ul>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <>
                        {/* Existing Channels */}
                        <div className="space-y-3">
                            {channels.map((channel) => (
                                <div
                                    key={channel.id}
                                    className="border border-gray-200 rounded-2xl p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm">
                                                {channel.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold">{channel.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{channel.code}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteChannel(channel.id)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Channel Stats */}
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <p className="text-xs text-gray-500">點擊</p>
                                            <p className="font-bold text-lg">{channel.clicks}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <p className="text-xs text-gray-500">轉化</p>
                                            <p className="font-bold text-lg">{channel.registrations}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <p className="text-xs text-gray-500">CVR</p>
                                            <p className="font-bold text-lg">{channel.cvr}%</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {totalClicks > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>佔總點擊比例</span>
                                                <span>{Math.round((channel.clicks / totalClicks) * 100)}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-black rounded-full transition-all"
                                                    style={{ width: `${(channel.clicks / totalClicks) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyLink(channel)}
                                            className="flex-1 rounded-full gap-2"
                                        >
                                            <Copy className="w-4 h-4" />
                                            複製連結
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedChannel(channel)}
                                            className="flex-1 rounded-full gap-2"
                                        >
                                            <QrCode className="w-4 h-4" />
                                            QR Code
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add New Channel */}
                        {channels.length < 3 && (
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 space-y-3">
                                <Label className="text-sm font-medium">新增通路（最多 3 個）</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        value={newChannelName}
                                        onChange={(e) => setNewChannelName(e.target.value)}
                                        placeholder="通路名稱（如：海報、FB、官網）"
                                        className="flex-1"
                                        maxLength={20}
                                    />
                                    <Button
                                        onClick={addChannel}
                                        disabled={!newChannelName.trim() || adding}
                                        className="rounded-full bg-black text-white gap-2"
                                    >
                                        {adding ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                新增
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {channels.length === 0 && (
                            <div className="text-center py-8">
                                <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 mb-2">尚未建立任何通路</p>
                                <p className="text-sm text-gray-400">建立通路後可追蹤不同渠道的推廣效果</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* QR Code Modal */}
            {selectedChannel && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedChannel(null)}
                >
                    <div
                        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">{selectedChannel.name} - 推廣 QR</h3>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedChannel(null)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <QRCodeGenerator
                            value={getChannelUrl(selectedChannel)}
                            type="promotion"
                            label={eventTitle}
                            defaultErrorLevel="Q"
                            allowErrorLevelChange={true}
                        />

                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                掃描此 QR Code 將被追蹤為「{selectedChannel.name}」通路來源
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
