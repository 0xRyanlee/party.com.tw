'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import LoadingButton from '@/components/LoadingButton';
import { toast } from 'sonner';

interface ReviewPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    eventTitle: string;
    eventImage?: string;
    onReviewSubmitted?: () => void;
}

export default function ReviewPromptModal({
    isOpen,
    onClose,
    eventId,
    eventTitle,
    eventImage,
    onReviewSubmitted,
}: ReviewPromptModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<'rating' | 'content' | 'done'>('rating');

    // 重置狀態
    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setContent('');
            setStep('rating');
        }
    }, [isOpen]);

    const handleRatingSelect = (value: number) => {
        setRating(value);
        // 選擇評分後自動前進到下一步
        setTimeout(() => setStep('content'), 300);
    };

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    rating,
                    content,
                    isAnonymous: false,
                }),
            });

            if (!response.ok) {
                throw new Error('提交失敗');
            }

            setStep('done');
            toast.success('感謝您的評價！');
            onReviewSubmitted?.();

            // 2秒後自動關閉
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Review submit error:', error);
            toast.error('提交失敗，請稍後再試');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        // 標記為已跳過，儲存到 localStorage
        localStorage.setItem(`review_skipped_${eventId}`, 'true');
        onClose();
    };

    const getRatingLabel = (value: number) => {
        switch (value) {
            case 1: return '不滿意';
            case 2: return '有待改進';
            case 3: return '普通';
            case 4: return '滿意';
            case 5: return '非常滿意';
            default: return '';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={handleSkip}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md"
                    >
                        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                            {/* Header with Event Image */}
                            <div className="relative h-32 bg-gradient-to-br from-zinc-800 to-zinc-900">
                                {eventImage && (
                                    <img
                                        src={eventImage}
                                        alt={eventTitle}
                                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <button
                                    onClick={handleSkip}
                                    className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-4 left-6 right-6">
                                    <p className="text-white/60 text-xs font-medium uppercase tracking-wider">活動已結束</p>
                                    <h3 className="text-white font-bold text-lg truncate">{eventTitle}</h3>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <AnimatePresence mode="wait">
                                    {step === 'rating' && (
                                        <motion.div
                                            key="rating"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4"
                                        >
                                            <div className="text-center">
                                                <h4 className="text-lg font-bold text-zinc-900">這次活動體驗如何？</h4>
                                                <p className="text-sm text-zinc-500 mt-1">您的評價有助於其他參與者</p>
                                            </div>

                                            {/* Star Rating */}
                                            <div className="flex justify-center gap-2 py-4">
                                                {[1, 2, 3, 4, 5].map((value) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => handleRatingSelect(value)}
                                                        onMouseEnter={() => setHoverRating(value)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        className="p-1 transition-transform hover:scale-125 active:scale-95"
                                                    >
                                                        <Star
                                                            className={`w-10 h-10 transition-colors ${value <= (hoverRating || rating)
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-zinc-200'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Rating Label */}
                                            <div className="h-6 text-center">
                                                <p className="text-sm font-medium text-zinc-600">
                                                    {getRatingLabel(hoverRating || rating)}
                                                </p>
                                            </div>

                                            {/* Skip Button */}
                                            <button
                                                onClick={handleSkip}
                                                className="w-full text-sm text-zinc-400 hover:text-zinc-600 py-2"
                                            >
                                                稍後再說
                                            </button>
                                        </motion.div>
                                    )}

                                    {step === 'content' && (
                                        <motion.div
                                            key="content"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4"
                                        >
                                            <div className="text-center">
                                                <div className="flex justify-center gap-1 mb-2">
                                                    {[1, 2, 3, 4, 5].map((value) => (
                                                        <Star
                                                            key={value}
                                                            className={`w-5 h-5 ${value <= rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-zinc-200'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <h4 className="text-lg font-bold text-zinc-900">
                                                    {rating >= 4 ? '太棒了！' : rating >= 3 ? '感謝您的反饋' : '我們會努力改進'}
                                                </h4>
                                                <p className="text-sm text-zinc-500 mt-1">願意分享更多嗎？（選填）</p>
                                            </div>

                                            {/* Content Textarea */}
                                            <Textarea
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                placeholder="分享您的活動體驗..."
                                                className="rounded-2xl min-h-[100px] resize-none"
                                            />

                                            {/* Buttons */}
                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setStep('rating')}
                                                    className="flex-1 rounded-full"
                                                >
                                                    返回
                                                </Button>
                                                <LoadingButton
                                                    onClick={handleSubmit}
                                                    isLoading={isSubmitting}
                                                    loadingText="提交中..."
                                                    className="flex-1 bg-black text-white rounded-full hover:bg-zinc-800"
                                                >
                                                    提交評價
                                                </LoadingButton>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 'done' && (
                                        <motion.div
                                            key="done"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-8"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', damping: 10 }}
                                                className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                            >
                                                <Star className="w-8 h-8 fill-emerald-500 text-emerald-500" />
                                            </motion.div>
                                            <h4 className="text-lg font-bold text-zinc-900">感謝您的評價！</h4>
                                            <p className="text-sm text-zinc-500 mt-1">您的反饋對我們非常重要</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
