import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/events/[eventId]/registrations/checkin - Verify check-in code
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ eventId: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();

        // Get current user (must be organizer)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is the event organizer
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('organizer_id')
            .eq('id', params.eventId)
            .single();

        if (eventError || !event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        if (event.organizer_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden: Only organizers can perform check-in' }, { status: 403 });
        }

        // Get check-in code from body
        const body = await request.json();
        const { checkinCode } = body;

        if (!checkinCode) {
            return NextResponse.json({ error: 'Check-in code is required' }, { status: 400 });
        }

        // Find registration by code and eventId
        const { data: registration, error: regError } = await supabase
            .from('registrations')
            .select('id, attendee_name, status, checkin_at')
            .eq('event_id', params.eventId)
            .eq('checkin_code', checkinCode.toUpperCase())
            .single();

        if (regError || !registration) {
            return NextResponse.json({ error: '無效的簽到碼 (Invalid code)' }, { status: 404 });
        }

        if (registration.checkin_at) {
            return NextResponse.json({
                error: '此代碼已於 ' + new Date(registration.checkin_at).toLocaleString('zh-TW') + ' 簽到過',
                registration
            }, { status: 400 });
        }

        if (registration.status !== 'confirmed') {
            return NextResponse.json({ error: '報名狀態不符 (Status is: ' + registration.status + ')' }, { status: 400 });
        }

        // Update check-in time and status
        const { data: updatedReg, error: updateError } = await supabase
            .from('registrations')
            .update({
                checked_in: true,
                checked_in_at: new Date().toISOString(),
                checked_in_by: user.id
            })
            .eq('id', registration.id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: '簽到失敗，請重試' }, { status: 500 });
        }

        return NextResponse.json({
            message: '簽到成功！',
            attendeeName: updatedReg.attendee_name,
            checkinAt: updatedReg.checkin_at
        });

    } catch (error) {
        console.error('Check-in error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
