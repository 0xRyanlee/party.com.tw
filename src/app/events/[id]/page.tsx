import { createClient } from '@/lib/supabase/server';
import { Event } from '@/lib/mock-data';
import EventDetailClient from './EventDetailClient';
import { notFound } from 'next/navigation';

interface EventDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    const { data: dbEvent, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !dbEvent) {
        notFound();
    }

    // Check if user is already registered
    let isRegistered = false;
    if (user) {
        const { data: registration } = await supabase
            .from('registrations')
            .select('status')
            .eq('event_id', id)
            .eq('user_id', user.id)
            .single();
        isRegistered = !!registration && ['confirmed', 'pending'].includes(registration.status);
    }

    const startDate = new Date(dbEvent.start_time);
    const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayOfWeek = startDate.toLocaleDateString('en-US', { weekday: 'short' });
    const timeStr = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    let priceDisplay = 'Free';
    if (dbEvent.ticket_types && dbEvent.ticket_types.length > 0) {
        const prices = dbEvent.ticket_types.map((t: any) => Number(t.price));
        const minPrice = Math.min(...prices);
        priceDisplay = minPrice === 0 ? 'Free' : `NT$ ${minPrice}`;
    }

    const event: Event = {
        id: dbEvent.id,
        title: dbEvent.title,
        type: dbEvent.category || 'event',
        format: 'indoor',
        attributes: dbEvent.tags || [],
        date: dateStr,
        fullDate: dbEvent.start_time.split('T')[0],
        dayOfWeek: dayOfWeek,
        time: timeStr,
        location: dbEvent.venue_name || dbEvent.address || 'TBA',
        lat: dbEvent.gps_lat || 25.0330,
        lng: dbEvent.gps_lng || 121.5654,
        distance: 0,
        attendees: dbEvent.capacity_total - (dbEvent.capacity_remaining || 0),
        capacity: dbEvent.capacity_total || 0,
        image: dbEvent.cover_image || '',
        tags: dbEvent.tags || [],
        description: dbEvent.description_short || dbEvent.description_long || '',
        price: priceDisplay,
        organizer: {
            id: dbEvent.organizer_id,
            name: dbEvent.organizer_name || 'Organizer',
            avatar: dbEvent.organizer_avatar,
            role: 'member',
            verified: dbEvent.organizer_verified
        },
        isPromoted: false,
    };

    return (
        <EventDetailClient
            event={event}
            isLoggedIn={!!user}
            initialIsRegistered={isRegistered}
        />
    );
}
