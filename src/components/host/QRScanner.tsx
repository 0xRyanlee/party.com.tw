'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, ScanLine, CheckCircle, XCircle, Loader2, X } from 'lucide-react';

interface QRScannerProps {
    eventId: string;
    onCheckInSuccess?: (attendeeName: string, checkinCode: string) => void;
    onClose?: () => void;
}

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

export default function QRScanner({ eventId, onCheckInSuccess, onClose }: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState<ScanStatus>('idle');
    const [message, setMessage] = useState('');
    const [manualCode, setManualCode] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Start camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
                setStatus('scanning');
            }
        } catch (error) {
            console.error('Camera error:', error);
            setMessage('無法存取相機，請使用手動輸入');
            setStatus('error');
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
            setStatus('idle');
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Process check-in code
    const processCheckin = async (code: string) => {
        if (!code || isProcessing) return;

        setIsProcessing(true);
        setMessage('');

        try {
            const response = await fetch(`/api/events/${eventId}/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.toUpperCase() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '簽到失敗');
            }

            setStatus('success');
            setMessage(`✓ ${data.attendeeName || '匿名用戶'} 簽到成功！`);
            onCheckInSuccess?.(data.attendeeName || '', code);

            // Auto-reset after success
            setTimeout(() => {
                setStatus(cameraActive ? 'scanning' : 'idle');
                setMessage('');
                setManualCode('');
            }, 2000);

        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || '簽到失敗');

            // Auto-reset after error
            setTimeout(() => {
                setStatus(cameraActive ? 'scanning' : 'idle');
                setMessage('');
            }, 3000);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle manual input submit
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.length >= 4) {
            processCheckin(manualCode);
        }
    };

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                        <ScanLine className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold">掃碼核銷</h3>
                        <p className="text-xs text-gray-500">掃描或輸入簽到碼</p>
                    </div>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Camera View / Status Display */}
            <div className="relative aspect-square bg-gray-900">
                {cameraActive ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />

                        {/* Scanning overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-48 border-2 border-white/50 rounded-2xl">
                                <div className="w-full h-1 bg-green-400 animate-pulse" style={{
                                    animation: 'scan 2s ease-in-out infinite'
                                }} />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
                        {status === 'success' ? (
                            <div className="text-center space-y-3 animate-in fade-in">
                                <div className="w-20 h-20 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-white" />
                                </div>
                                <p className="text-white font-bold text-lg">{message}</p>
                            </div>
                        ) : status === 'error' ? (
                            <div className="text-center space-y-3 animate-in fade-in">
                                <div className="w-20 h-20 mx-auto rounded-full bg-red-500 flex items-center justify-center">
                                    <XCircle className="w-10 h-10 text-white" />
                                </div>
                                <p className="text-red-400 font-bold text-lg">{message}</p>
                            </div>
                        ) : (
                            <>
                                <Camera className="w-16 h-16 text-gray-500" />
                                <p className="text-gray-400 text-sm">點擊下方按鈕開啟相機</p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-4 space-y-4">
                {/* Camera Toggle */}
                <Button
                    onClick={cameraActive ? stopCamera : startCamera}
                    variant={cameraActive ? 'outline' : 'default'}
                    className={`w-full h-12 rounded-full gap-2 ${!cameraActive ? 'bg-black text-white' : ''}`}
                >
                    <Camera className="w-5 h-5" />
                    {cameraActive ? '關閉相機' : '開啟相機掃描'}
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">或手動輸入</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Manual Input */}
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <Input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                        placeholder="輸入簽到碼"
                        className="flex-1 h-12 text-center font-mono text-lg uppercase tracking-widest"
                        maxLength={10}
                        disabled={isProcessing}
                    />
                    <Button
                        type="submit"
                        disabled={manualCode.length < 4 || isProcessing}
                        className="h-12 px-6 rounded-full bg-black text-white"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : '確認'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
