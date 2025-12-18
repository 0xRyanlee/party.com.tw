'use client';

import { Star, ThumbsUp, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface Review {
    id: string;
    rating: number;
    title?: string;
    content?: string;
    isAnonymous: boolean;
    reviewerName?: string;
    reviewerAvatar?: string;
    helpfulCount: number;
    createdAt: string;
}

interface ReviewListProps {
    reviews: Review[];
    averageRating?: number;
    totalCount?: number;
}

export default function ReviewList({ reviews, averageRating, totalCount }: ReviewListProps) {
    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* 評價摘要 */}
            {averageRating !== undefined && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="text-center">
                        <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                        <div className="flex justify-center mt-1">{renderStars(Math.round(averageRating))}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                        共 {totalCount || reviews.length} 則評價
                    </div>
                </div>
            )}

            {/* 評價列表 */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        暫無評價，成為第一個評價的人！
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="p-4 border rounded-xl space-y-3">
                            {/* 評價者資訊 */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {review.isAnonymous ? (
                                            <User className="w-5 h-5 text-gray-400" />
                                        ) : review.reviewerAvatar ? (
                                            <img src={review.reviewerAvatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-medium text-gray-600">
                                                {review.reviewerName?.charAt(0) || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            {review.isAnonymous ? '匿名用戶' : review.reviewerName || '用戶'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(review.createdAt), {
                                                addSuffix: true,
                                                locale: zhTW,
                                            })}
                                        </div>
                                    </div>
                                </div>
                                {renderStars(review.rating)}
                            </div>

                            {/* 評價內容 */}
                            {review.title && (
                                <h4 className="font-medium">{review.title}</h4>
                            )}
                            {review.content && (
                                <p className="text-gray-600 text-sm leading-relaxed">{review.content}</p>
                            )}

                            {/* 互動按鈕 */}
                            <div className="flex items-center gap-4 pt-2">
                                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>有幫助 ({review.helpfulCount})</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
