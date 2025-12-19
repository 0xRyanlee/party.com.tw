import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import VendorDetailClient from './VendorDetailClient';

interface VendorPageProps {
    params: Promise<{ id: string }>;
}

export default async function VendorPage({ params }: VendorPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Try fetching by vendor_profile id first, then by user_id
    let { data: vendor, error } = await supabase
        .from('vendor_profiles')
        .select(`
            *,
            profiles:user_id (
                id,
                full_name,
                avatar_url,
                role
            )
        `)
        .or(`id.eq.${id},user_id.eq.${id}`)
        .single();

    if (error || !vendor) {
        notFound();
    }

    // Get current user follow status
    const { data: { user } } = await supabase.auth.getUser();
    let initialIsFollowing = false;
    if (user) {
        const { data: follow } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', vendor.user_id)
            .single();
        initialIsFollowing = !!follow;
    }

    // Get vendor stats (how many events they've participated in and ratings)
    const { data: events } = await supabase
        .from('events')
        .select('review_count, attendee_rating_score')
        .eq('organizer_id', vendor.user_id);

    const eventCount = events?.length || 0;
    const totalReviews = events?.reduce((acc, curr) => acc + (curr.review_count || 0), 0) || 0;
    const avgRating = events?.length
        ? events.reduce((acc, curr) => acc + (Number(curr.attendee_rating_score) || 0), 0) / events.length
        : 0;

    return (
        <VendorDetailClient
            vendor={vendor}
            initialIsFollowing={initialIsFollowing}
            isLoggedIn={!!user}
            eventCount={eventCount}
            totalReviews={totalReviews}
            avgRating={avgRating}
        />
    );
}
