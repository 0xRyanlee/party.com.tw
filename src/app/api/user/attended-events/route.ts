import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/user/attended-events - 獲取用戶已參加的活動
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    // 獲取用戶已報名且活動已結束的記錄
    const { data, error } = await supabase
        .from('registrations')
        .select(`
            id,
            checked_in,
            checked_in_at,
            event:events!registrations_event_id_fkey (
                id,
                title,
                description,
                cover_image,
                start_datetime,
                end_datetime,
                location_name,
                organizer:profiles!events_organizer_id_fkey (
                    id,
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching attended events:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 過濾出已結束的活動
    const now = new Date();
    const attendedEvents = data?.filter(r => {
        const event = r.event as { end_datetime?: string };
        if (!event?.end_datetime) return false;
        return new Date(event.end_datetime) < now;
    }).map(r => ({
        registration_id: r.id,
        checked_in: r.checked_in,
        checked_in_at: r.checked_in_at,
        event: r.event,
    })) || [];

    return NextResponse.json(attendedEvents);
}
