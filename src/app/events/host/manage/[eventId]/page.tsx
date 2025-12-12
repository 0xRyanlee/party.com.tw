import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ManageClient from './ManageClient';

export default async function ManageEventPage({
    params,
}: {
    params: { eventId: string };
}) {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/auth');
    }

    // Fetch event data
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', params.eventId)
        .single();

    if (eventError || !event) {
        redirect('/host/dashboard');
    }

    // Check if user is the organizer
    if (event.organizer_id !== user.id) {
        redirect('/host/dashboard');
    }

    // Fetch registrations count (placeholder - will implement in Phase 12)
    const registeredCount = event.registered_count || 0;
    const checkedInCount = 0; // TODO: Implement in Phase 12
    const waitlistCount = 0; // TODO: Implement in Phase 12

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ManageClient
                event={event}
                stats={{
                    registered: registeredCount,
                    capacity: event.capacity_total || 0,
                    checkedIn: checkedInCount,
                    waitlist: waitlistCount,
                }}
            />
        </Suspense>
    );
}
