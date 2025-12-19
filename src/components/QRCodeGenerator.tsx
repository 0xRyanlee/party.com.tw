'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, QrCode, Copy } from 'lucide-react';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

interface QRCodeGeneratorProps {
    value: string;
    size?: number;
    type?: 'promotion' | 'checkin';
    label?: string;
    showDownload?: boolean;
    showCopy?: boolean;
    defaultErrorLevel?: ErrorCorrectionLevel;
    allowErrorLevelChange?: boolean;
}

const ERROR_LEVELS: { level: ErrorCorrectionLevel; label: string; tolerance: string }[] = [
    { level: 'L', label: 'Low', tolerance: '~7%' },
    { level: 'M', label: 'Medium', tolerance: '~15%' },
    { level: 'Q', label: 'Quartile', tolerance: '~25%' },
    { level: 'H', label: 'High', tolerance: '~30%' },
];

export default function QRCodeGenerator({
    value,
    size = 200,
    type = 'promotion',
    label,
    showDownload = true,
    showCopy = true,
    defaultErrorLevel = 'M',
    allowErrorLevelChange = true,
}: QRCodeGeneratorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>(defaultErrorLevel);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (canvasRef.current && value) {
            QRCode.toCanvas(canvasRef.current, value, {
                width: size,
                margin: 2,
                errorCorrectionLevel: errorLevel,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            });
        }
    }, [value, size, errorLevel]);

    const handleDownload = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = `qr-${type}-${Date.now()}.png`;
            link.href = canvasRef.current.toDataURL('image/png');
            link.click();
        }
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const typeLabel = type === 'promotion' ? '推廣連結' : '簽到專用';
    const typeColor = type === 'promotion' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-green-50 border-green-200 text-green-700';

    return (
        <div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* Type Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${typeColor}`}>
                {type === 'promotion' ? <QrCode className="w-3 h-3 inline mr-1" /> : null}
                {typeLabel}
            </div>

            {/* Label */}
            {label && <p className="text-sm font-medium text-gray-700">{label}</p>}

            {/* QR Code Canvas */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-inner">
                <canvas ref={canvasRef} />
            </div>

            {/* Error Correction Level Selector */}
            {allowErrorLevelChange && (
                <div className="w-full space-y-2">
                    <Label className="text-xs text-gray-500">容錯率 (Error Correction)</Label>
                    <div className="grid grid-cols-4 gap-1">
                        {ERROR_LEVELS.map((el) => (
                            <button
                                key={el.level}
                                type="button"
                                onClick={() => setErrorLevel(el.level)}
                                className={`py-2 px-1 rounded-lg text-xs font-medium transition-all border ${errorLevel === el.level
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div>{el.level}</div>
                                <div className="text-[9px] opacity-70">{el.tolerance}</div>
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 text-center">
                        建議印刷用途選擇 Q 或 H 以確保損壞後仍可掃描
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 w-full">
                {showDownload && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="flex-1 gap-2 rounded-full"
                    >
                        <Download className="w-4 h-4" />
                        下載 PNG
                    </Button>
                )}
                {showCopy && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="flex-1 gap-2 rounded-full"
                    >
                        <Copy className="w-4 h-4" />
                        {copied ? '已複製!' : '複製連結'}
                    </Button>
                )}
            </div>
        </div>
    );
}
