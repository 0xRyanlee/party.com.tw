'use client';

import { useState, useEffect } from 'react';
import { X, Share, Plus, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PWAInstallPromptProps {
    onDismiss?: () => void;
}

export default function PWAInstallPrompt({ onDismiss }: PWAInstallPromptProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // 檢測是否為 iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // 檢測是否已經是 PWA 模式
        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        setIsStandalone(standalone);

        // 檢查是否已經關閉過（localStorage）
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        const lastDismissed = dismissed ? new Date(dismissed) : null;
        const daysSinceDismiss = lastDismissed
            ? (Date.now() - lastDismissed.getTime()) / (1000 * 60 * 60 * 24)
            : null;

        // 只在手機端、非 PWA 模式、未關閉或超過 7 天後顯示
        const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
        if (isMobile && !standalone && (!daysSinceDismiss || daysSinceDismiss > 7)) {
            // 延遲顯示
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
        onDismiss?.();
    };

    if (!isVisible || isStandalone) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none">
            <div className="bg-white rounded-2xl shadow-xl p-4 max-w-md mx-auto pointer-events-auto animate-in slide-in-from-bottom duration-300">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0">
                        <Home className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-lg">加入主畫面</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            將 Party 加入主畫面，享受更流暢的體驗
                        </p>

                        {isIOS ? (
                            <div className="mt-3 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">1</span>
                                    <span>點擊底部</span>
                                    <Share className="w-4 h-4" />
                                    <span>分享按鈕</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">2</span>
                                    <span>選擇「加入主畫面」</span>
                                    <Plus className="w-4 h-4" />
                                </div>
                            </div>
                        ) : (
                            <Button
                                className="mt-3 bg-black text-white rounded-full w-full"
                                onClick={() => {
                                    // 觸發 PWA 安裝提示（如果可用）
                                    const deferredPrompt = (window as any).deferredPwaPrompt;
                                    if (deferredPrompt) {
                                        deferredPrompt.prompt();
                                    }
                                    handleDismiss();
                                }}
                            >
                                立即安裝
                            </Button>
                        )}
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
