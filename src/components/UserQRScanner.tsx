'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import jsQR from 'jsqr';

interface UserQRScannerProps {
    onScanSuccess: (code: string, type: 'redeem' | 'event' | 'unknown') => void;
    onClose: () => void;
}

export default function UserQRScanner({ onScanSuccess, onClose }: UserQRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState('');
    const [scanResult, setScanResult] = useState<string | null>(null);
    const animationRef = useRef<number | null>(null);

    const startCamera = useCallback(async () => {
        try {
            setError('');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setIsScanning(true);
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError('無法存取相機。請確認已授權相機權限。');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    }, []);

    const detectQRType = (value: string): 'redeem' | 'event' | 'unknown' => {
        // Check if it's a URL to event page
        if (value.includes('/events/') || value.includes('/e/')) {
            return 'event';
        }
        // Check if it's a redeem code format (alphanumeric, typically 6-20 chars)
        if (/^[A-Z0-9]{4,20}$/i.test(value)) {
            return 'redeem';
        }
        // URL with code param
        if (value.includes('?code=') || value.includes('&code=')) {
            return 'redeem';
        }
        return 'unknown';
    };

    const extractCode = (value: string): string => {
        // Try to extract code from URL
        try {
            const url = new URL(value);
            const code = url.searchParams.get('code');
            if (code) return code.toUpperCase();

            // Extract event ID from path
            const eventMatch = value.match(/\/events\/([a-f0-9-]+)/i);
            if (eventMatch) return eventMatch[1];
        } catch {
            // Not a URL, return as-is
        }
        return value.toUpperCase();
    };

    const scan = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
            animationRef.current = requestAnimationFrame(scan);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

        if (qrCode) {
            // Vibrate on success
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }

            const extractedCode = extractCode(qrCode.data);
            const type = detectQRType(qrCode.data);

            setScanResult(extractedCode);
            stopCamera();

            // Brief delay to show success, then callback
            setTimeout(() => {
                onScanSuccess(extractedCode, type);
            }, 500);
            return;
        }

        animationRef.current = requestAnimationFrame(scan);
    }, [stopCamera, onScanSuccess]);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    useEffect(() => {
        if (isScanning && !scanResult) {
            scan();
        }
    }, [isScanning, scan, scanResult]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                <div className="text-white">
                    <h2 className="font-bold">掃描 QR Code</h2>
                    <p className="text-sm text-white/70">對準活動海報或票券上的 QR Code</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { stopCamera(); onClose(); }}
                    className="text-white hover:bg-white/20"
                >
                    <X className="w-6 h-6" />
                </Button>
            </div>

            {/* Camera View */}
            <div className="flex-1 relative flex items-center justify-center">
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Scan Frame */}
                {isScanning && !scanResult && (
                    <div className="relative w-64 h-64 z-10">
                        {/* Corner decorations */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />

                        {/* Scanning line animation */}
                        <div className="absolute inset-x-2 top-2 h-0.5 bg-green-400 animate-bounce" style={{ animationDuration: '1.5s' }} />
                    </div>
                )}

                {/* Loading State */}
                {!isScanning && !error && !scanResult && (
                    <div className="flex flex-col items-center gap-4 z-10">
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                        <p className="text-white">正在啟動相機...</p>
                    </div>
                )}

                {/* Success State */}
                {scanResult && (
                    <div className="flex flex-col items-center gap-4 z-10 bg-green-500/90 p-8 rounded-3xl">
                        <CheckCircle className="w-16 h-16 text-white" />
                        <div className="text-center text-white">
                            <p className="font-bold text-lg">掃描成功！</p>
                            <p className="text-sm opacity-90 font-mono">{scanResult}</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center gap-4 z-10 p-8">
                        <AlertCircle className="w-16 h-16 text-red-400" />
                        <p className="text-white text-center">{error}</p>
                        <Button
                            onClick={startCamera}
                            variant="outline"
                            className="rounded-full bg-white/20 border-white/30 text-white"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            重試
                        </Button>
                    </div>
                )}
            </div>

            {/* Footer hint */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="text-center text-white/80 text-sm space-y-1">
                    <p>支援掃描：活動 QR Code、兌換碼、票券連結</p>
                </div>
            </div>
        </div>
    );
}
