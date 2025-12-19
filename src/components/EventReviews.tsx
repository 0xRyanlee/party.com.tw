'use client';

import { useState, useEffect } from 'react';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';

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

interface EventReviewsProps {
    eventId: string;
    isLoggedIn: boolean;
    canReview: boolean;
}

export default function EventReviews({ eventId, isLoggedIn, canReview }: EventReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [averageRating, setAverageRating] = useState(0);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`/api/reviews?eventId=${eventId}`);
            if (response.ok) {
                const data = await response.json();
                const formattedReviews = data.reviews.map((r: any) => ({
                    id: r.id,
                    rating: r.rating,
                    title: r.title,
                    content: r.content,
                    isAnonymous: r.is_anonymous,
                    reviewerName: r.reviewer?.full_name,
                    reviewerAvatar: r.reviewer?.avatar_url,
                    helpfulCount: 0, // TODO: 實作有幫助功能
                    createdAt: r.created_at,
                }));
                setReviews(formattedReviews);

                if (formattedReviews.length > 0) {
                    const avg = formattedReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / formattedReviews.length;
                    setAverageRating(avg);
                }
            }
        } catch (error) {
            console.error('Fetch reviews error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [eventId]);

    const handleReviewSubmit = () => {
        setShowForm(false);
        fetchReviews();
    };

    if (loading) {
        return <div className="animate-pulse h-40 bg-gray-100 rounded-3xl" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">活動評價</h2>
                {canReview && !showForm && (
                    <Button
                        onClick={() => setShowForm(true)}
                        className="rounded-full bg-black text-white hover:bg-gray-800"
                    >
                        <MessageSquarePlus className="w-4 h-4 mr-2" />
                        我要評價
                    </Button>
                )}
            </div>

            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <ReviewForm
                        eventId={eventId}
                        onSubmit={handleReviewSubmit}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            <ReviewList
                reviews={reviews}
                averageRating={averageRating > 0 ? averageRating : undefined}
                totalCount={reviews.length}
            />
        </div>
    );
}
