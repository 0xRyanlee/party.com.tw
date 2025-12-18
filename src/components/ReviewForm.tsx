'use client';

import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import LoadingButton from '@/components/LoadingButton';

interface ReviewFormProps {
    eventId: string;
    onSubmit?: (review: ReviewData) => void;
    onCancel?: () => void;
}

interface ReviewData {
    rating: number;
    title: string;
    content: string;
    isAnonymous: boolean;
}

export default function ReviewForm({ eventId, onSubmit, onCancel }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);

        const reviewData: ReviewData = {
            rating,
            title,
            content,
            isAnonymous,
        };

        // API 提交
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    rating,
                    title,
                    content,
                    isAnonymous,
                }),
            });

            if (!response.ok) {
                throw new Error('提交失敗');
            }
        } catch (error) {
            console.error('Review submit error:', error);
            setIsSubmitting(false);
            return;
        }

        onSubmit?.(reviewData);
        setIsSubmitting(false);

        // 重置表單
        setRating(0);
        setTitle('');
        setContent('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl border">
            <h3 className="font-semibold text-lg">撰寫評價</h3>

            {/* 星級評分 */}
            <div className="space-y-2">
                <label className="text-sm text-gray-600">評分</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-8 h-8 ${star <= (hoverRating || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="text-sm text-gray-500">
                        {rating === 1 && '不滿意'}
                        {rating === 2 && '有待改進'}
                        {rating === 3 && '普通'}
                        {rating === 4 && '滿意'}
                        {rating === 5 && '非常滿意'}
                    </p>
                )}
            </div>

            {/* 標題 */}
            <div className="space-y-2">
                <label className="text-sm text-gray-600">標題（選填）</label>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="一句話總結您的體驗"
                    className="rounded-xl"
                />
            </div>

            {/* 內容 */}
            <div className="space-y-2">
                <label className="text-sm text-gray-600">詳細評價（選填）</label>
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="分享您的活動體驗..."
                    className="rounded-xl min-h-[100px]"
                />
            </div>

            {/* 匿名選項 */}
            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded"
                />
                <span className="text-gray-600">匿名評價</span>
            </label>

            {/* 按鈕 */}
            <div className="flex gap-2 pt-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-full">
                        取消
                    </Button>
                )}
                <LoadingButton
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText="提交中..."
                    disabled={rating === 0}
                    className="flex-1 rounded-full"
                >
                    <Send className="w-4 h-4 mr-2" />
                    提交評價
                </LoadingButton>
            </div>
        </form>
    );
}
