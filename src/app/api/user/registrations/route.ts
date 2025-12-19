import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch registrations for this user with event details
        const { data: registrations, error: fetchError } = await supabase
            .from('registrations')
            .select(`
                id,
                event_id,
                status,
                checked_in,
                created_at,
                event:events(
                    id,
                    title,
                    start_time,
                    venue_name,
                    cover_image,
                    status
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('Fetch user registrations error:', fetchError);
            return NextResponse.json(
                { error: 'Failed to fetch registrations' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            registrations: registrations || [],
        });

    } catch (error) {
        console.error('User registrations error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
