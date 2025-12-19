'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Ticket, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import QRCodeGenerator from '@/components/QRCodeGenerator';

type RedeemStatus = 'idle' | 'loading' | 'success' | 'error';

interface RedeemResult {
    eventTitle: string;
    checkinCode: string;
    eventId: string;
}

export default function RedeemPage() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<RedeemStatus>('idle');
    const [error, setError] = useState('');
    const [result, setResult] = useState<RedeemResult | null>(null);

    const handleRedeem = async () => {
        if (!code || code.length < 4) {
            setError('請輸入有效的兌換碼');
            setStatus('error');
            return;
        }

        setStatus('loading');
        setError('');

        try {
            const response = await fetch('/api/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.toUpperCase() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '兌換失敗');
            }

            setResult({
                eventTitle: data.eventTitle,
                checkinCode: data.checkinCode,
                eventId: data.eventId,
            });
            setStatus('success');
        } catch (err: any) {
            setError(err.message || '兌換失敗，請確認兌換碼正確');
            setStatus('error');
        }
    };

    const getCheckinPageUrl = (eventId: string, checkinCode: string) => {
        if (typeof window === 'undefined') return '';
        return `${window.location.origin}/user/my-events?checkin=${checkinCode}&event=${eventId}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 py-4 px-6">
                <div className="max-w-md mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">兌換碼中心</h1>
                        <p className="text-xs text-gray-500">Redeem Center</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {status !== 'success' ? (
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold">輸入您的兌換碼</h2>
                                <p className="text-sm text-gray-500">
                                    輸入公關票或活動兌換碼，立即獲取參與資格
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">兌換碼</Label>
                                    <Input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="例如：PARTY2024"
                                        className="h-14 text-xl font-mono text-center uppercase tracking-widest"
                                        maxLength={20}
                                        disabled={status === 'loading'}
                                    />
                                </div>

                                {status === 'error' && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <Button
                                    onClick={handleRedeem}
                                    disabled={status === 'loading' || !code}
                                    className="w-full h-14 rounded-full bg-black text-white text-lg font-bold gap-2"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            驗證中...
                                        </>
                                    ) : (
                                        <>
                                            兌換
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            </div>

                            <p className="text-xs text-gray-400 text-center">
                                兌換碼通常由活動主辦方提供，用於公關票或特殊邀請
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-green-600">兌換成功！</h2>
                                <p className="text-sm text-gray-600">
                                    您已獲得「{result?.eventTitle}」的參與資格
                                </p>
                            </div>

                            {/* Check-in QR Code */}
                            <QRCodeGenerator
                                value={getCheckinPageUrl(result?.eventId || '', result?.checkinCode || '')}
                                type="checkin"
                                label="簽到專用 QR Code"
                                showCopy={false}
                                defaultErrorLevel="H"
                                allowErrorLevelChange={false}
                            />

                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-xs text-gray-500 mb-1">您的簽到碼</p>
                                <p className="text-2xl font-bold font-mono tracking-widest">
                                    {result?.checkinCode}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push(`/events/${result?.eventId}`)}
                                    variant="outline"
                                    className="w-full h-12 rounded-full"
                                >
                                    查看活動詳情
                                </Button>
                                <Button
                                    onClick={() => router.push('/user/my-events')}
                                    className="w-full h-12 rounded-full bg-black text-white"
                                >
                                    前往我的活動
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
