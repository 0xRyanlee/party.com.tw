'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, ScanLine, CheckCircle, XCircle, Loader2, X, Vibrate } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerProps {
    eventId: string;
    onCheckInSuccess?: (attendeeName: string, checkinCode: string) => void;
    onClose?: () => void;
}

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

export default function QRScanner({ eventId, onCheckInSuccess, onClose }: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const lastScannedRef = useRef<string>('');

    const [status, setStatus] = useState<ScanStatus>('idle');
    const [message, setMessage] = useState('');
    const [manualCode, setManualCode] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scannedCode, setScannedCode] = useState<string | null>(null);

    // Scan QR code from video frame
    const scanFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !cameraActive || isProcessing) {
            animationRef.current = requestAnimationFrame(scanFrame);
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
            animationRef.current = requestAnimationFrame(scanFrame);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
        });

        if (code && code.data && code.data !== lastScannedRef.current) {
            lastScannedRef.current = code.data;
            setScannedCode(code.data);

            // Vibrate for feedback if supported
            if ('vibrate' in navigator) {
                navigator.vibrate(200);
            }

            // Extract check-in code from QR data
            const checkInCode = extractCheckInCode(code.data);
            if (checkInCode) {
                processCheckin(checkInCode);
            }
        }

        animationRef.current = requestAnimationFrame(scanFrame);
    }, [cameraActive, isProcessing]);

    // Extract check-in code from QR data (URL or direct code)
    const extractCheckInCode = (qrData: string): string | null => {
        // If it's a URL, try to extract code parameter
        try {
            const url = new URL(qrData);
            const code = url.searchParams.get('code') || url.searchParams.get('c');
            if (code) return code;

            // Check if last path segment is the code
            const pathParts = url.pathname.split('/').filter(Boolean);
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart && lastPart.length >= 4 && lastPart.length <= 10) {
                return lastPart;
            }
        } catch {
            // Not a URL, treat as direct code
        }

        // Direct code (4-10 alphanumeric characters)
        if (/^[A-Za-z0-9]{4,10}$/.test(qrData)) {
            return qrData;
        }

        return null;
    };

    // Start camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
                setStatus('scanning');
                lastScannedRef.current = ''; // Reset last scanned
            }
        } catch (error) {
            console.error('Camera error:', error);
            setMessage('無法存取相機，請使用手動輸入');
            setStatus('error');
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
            setStatus('idle');
        }
    };

    // Start scanning when camera is active
    useEffect(() => {
        if (cameraActive) {
            animationRef.current = requestAnimationFrame(scanFrame);
        }
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [cameraActive, scanFrame]);

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
            setMessage(`✓ ${data.attendeeName || '訪客'} 簽到成功！`);
            onCheckInSuccess?.(data.attendeeName || '', code);

            // Auto-reset after success
            setTimeout(() => {
                setStatus(cameraActive ? 'scanning' : 'idle');
                setMessage('');
                setManualCode('');
                lastScannedRef.current = ''; // Allow re-scan
            }, 2500);

        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || '簽到失敗');

            // Auto-reset after error
            setTimeout(() => {
                setStatus(cameraActive ? 'scanning' : 'idle');
                setMessage('');
                lastScannedRef.current = ''; // Allow re-scan
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
            {/* Hidden canvas for QR processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                        <ScanLine className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold">掃碼核銷</h3>
                        <p className="text-xs text-gray-500">
                            {cameraActive ? '對準 QR Code 自動掃描' : '掃描或輸入簽到碼'}
                        </p>
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
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="relative w-56 h-56">
                                {/* Corner brackets */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />

                                {/* Scanning line */}
                                {status === 'scanning' && !isProcessing && (
                                    <div
                                        className="absolute left-0 right-0 h-0.5 bg-green-400 shadow-lg shadow-green-400/50"
                                        style={{
                                            animation: 'scanLine 2s ease-in-out infinite',
                                            top: '50%'
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Status overlay */}
                        {status === 'success' && (
                            <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center animate-in fade-in">
                                <div className="text-center text-white">
                                    <CheckCircle className="w-16 h-16 mx-auto mb-3" />
                                    <p className="font-bold text-lg">{message}</p>
                                </div>
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center animate-in fade-in">
                                <div className="text-center text-white">
                                    <XCircle className="w-16 h-16 mx-auto mb-3" />
                                    <p className="font-bold text-lg">{message}</p>
                                </div>
                            </div>
                        )}
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
                                <p className="text-gray-400 text-sm text-center">
                                    點擊下方按鈕開啟相機<br />
                                    <span className="text-xs">自動偵測 QR Code</span>
                                </p>
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
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Camera className="w-5 h-5" />
                    )}
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

            {/* CSS for scan animation */}
            <style jsx>{`
                @keyframes scanLine {
                    0%, 100% { top: 10%; }
                    50% { top: 90%; }
                }
            `}</style>
        </div>
    );
}
