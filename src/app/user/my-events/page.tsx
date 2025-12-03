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
    const { data: rawRegistrations, error } = await supabase
        .from('registrations')
        .select(`
            id,
            status,
            checked_in,
            created_at,
            event:events!inner (
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

    // Transform the data: Supabase returns event as an array, we need it as a single object
    const registrations = rawRegistrations?.map((reg: any) => ({
        ...reg,
        event: Array.isArray(reg.event) ? reg.event[0] : reg.event,
    })) || [];

    return <MyEventsClient registrations={registrations} />;
}
