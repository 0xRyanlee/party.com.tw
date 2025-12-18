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

    // Fetch registration stats
    const { data: registrations } = await supabase
        .from('registrations')
        .select('status, checked_in')
        .eq('event_id', params.eventId);

    const registeredCount = registrations?.filter(r => r.status === 'confirmed').length || 0;
    const checkedInCount = registrations?.filter(r => r.checked_in === true).length || 0;
    const waitlistCount = registrations?.filter(r => r.status === 'waitlist').length || 0;

    return (
        <Suspense fallback={<div>載入中...</div>}>
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
