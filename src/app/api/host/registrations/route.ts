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

        // Fetch registrations for all events owned by this organizer
        const { data: registrations, error: fetchError } = await supabase
            .from('registrations')
            .select(`
                *,
                event:events!inner(id, title, organizer_id)
            `)
            .eq('events.organizer_id', user.id)
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('Fetch host registrations error:', fetchError);
            return NextResponse.json(
                { error: 'Failed to fetch registrations' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            registrations,
        });

    } catch (error) {
        console.error('Host registrations logic error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
