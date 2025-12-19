import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/redeem
 * Redeems a PR/Ticket code and registers the user for the event.
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '請先登入' }, { status: 401 });
        }

        const body = await request.json();
        const { code } = body;

        if (!code || code.length < 4) {
            return NextResponse.json({ error: '無效的兌換碼' }, { status: 400 });
        }

        // Look up the redemption code in tickets or special codes table
        // For MVP, we'll check against invitation_code in events table
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id, title, capacity_total, capacity_filled')
            .eq('invitation_code', code.toUpperCase())
            .single();

        if (eventError || !event) {
            return NextResponse.json({ error: '兌換碼不存在或已過期' }, { status: 404 });
        }

        // Check capacity
        if (event.capacity_total && event.capacity_filled >= event.capacity_total) {
            return NextResponse.json({ error: '活動已額滿' }, { status: 400 });
        }

        // Check if already registered
        const { data: existingReg } = await supabase
            .from('registrations')
            .select('id')
            .eq('event_id', event.id)
            .eq('user_id', user.id)
            .single();

        if (existingReg) {
            // Get existing check-in code
            const { data: regDetails } = await supabase
                .from('registrations')
                .select('checkin_code')
                .eq('id', existingReg.id)
                .single();

            return NextResponse.json({
                message: '您已報名此活動',
                eventId: event.id,
                eventTitle: event.title,
                checkinCode: regDetails?.checkin_code || '',
            });
        }

        // Generate check-in code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let checkinCode = '';
        for (let i = 0; i < 6; i++) {
            checkinCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Create registration
        const { data: registration, error: regError } = await supabase
            .from('registrations')
            .insert({
                event_id: event.id,
                user_id: user.id,
                status: 'confirmed',
                attendee_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest',
                attendee_email: user.email || '',
                checkin_code: checkinCode,
                registration_source: 'redeem',
            })
            .select('id, checkin_code')
            .single();

        if (regError) {
            console.error('Registration error:', regError);
            return NextResponse.json({ error: '報名失敗，請稍後再試' }, { status: 500 });
        }

        return NextResponse.json({
            message: '兌換成功！',
            eventId: event.id,
            eventTitle: event.title,
            checkinCode: registration.checkin_code,
        });

    } catch (error: any) {
        console.error('Redeem error:', error);
        return NextResponse.json({ error: error.message || '系統錯誤' }, { status: 500 });
    }
}
