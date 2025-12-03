import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MyEventsClient from './MyEventsClient';

export default async function MyEventsPage() {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/auth');
    }

    // Fetch user's registrations with event details
    const { data: registrations, error } = await supabase
        .from('registrations')
        .select(`
            id,
            status,
            checked_in,
            created_at,
            events (
                id,
                title,
                description_short,
                start_time,
                end_time,
                venue_name,
                address,
                cover_image,
                category,
                tags,
                capacity_total,
                registered_count,
                status
            )
        `)
        .eq('user_id', user.id)
        .in('status', ['confirmed', 'pending', 'waitlist', 'cancelled'])
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching registrations:', error);
    }

    return <MyEventsClient registrations={registrations || []} />;
}
