import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST /api/tickets/transfer
// Transfer a ticket to another user by email
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ticketId, recipientEmail } = body;

        if (!ticketId || !recipientEmail) {
            return NextResponse.json(
                { error: '缺少必要參數' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            return NextResponse.json(
                { error: '無效的 Email 格式' },
                { status: 400 }
            );
        }

        // Create Supabase client with service role for admin operations
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Get current user from auth header or session
        const authHeader = request.headers.get('authorization');
        let currentUserId: string | null = null;

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { data: { user } } = await supabase.auth.getUser(token);
            currentUserId = user?.id ?? null;
        }

        // Try to get user from cookie session if no auth header
        if (!currentUserId) {
            // For client-side requests, we need to verify the session differently
            // This is a simplified check - in production, implement proper session verification
            return NextResponse.json(
                { error: '請先登入' },
                { status: 401 }
            );
        }

        // 2. Verify the ticket exists and belongs to current user
        const { data: ticket, error: ticketError } = await supabase
            .from('registrations')
            .select('*, events(title)')
            .eq('id', ticketId)
            .eq('user_id', currentUserId)
            .single();

        if (ticketError || !ticket) {
            return NextResponse.json(
                { error: '找不到此票券或您沒有權限' },
                { status: 404 }
            );
        }

        // 3. Check if ticket is in a transferable state
        if (ticket.status !== 'confirmed' || ticket.checked_in) {
            return NextResponse.json(
                { error: '此票券狀態不允許轉送' },
                { status: 400 }
            );
        }

        // 4. Find or create recipient user
        const { data: recipientUser, error: recipientError } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('email', recipientEmail)
            .single();

        let recipientId: string;

        if (recipientError || !recipientUser) {
            // Recipient doesn't have an account yet
            // Option 1: Reject transfer (safer)
            // Option 2: Create a pending transfer record
            // For now, we'll reject and ask them to use an existing account
            return NextResponse.json(
                { error: '該 Email 尚未註冊 Party 帳號，請請對方先註冊' },
                { status: 400 }
            );
        }

        recipientId = recipientUser.id;

        // 5. Prevent self-transfer
        if (recipientId === currentUserId) {
            return NextResponse.json(
                { error: '無法轉送給自己' },
                { status: 400 }
            );
        }

        // 6. Check if recipient already has a ticket for this event
        const { data: existingRegistration } = await supabase
            .from('registrations')
            .select('id')
            .eq('event_id', ticket.event_id)
            .eq('user_id', recipientId)
            .eq('status', 'confirmed')
            .single();

        if (existingRegistration) {
            return NextResponse.json(
                { error: '該用戶已擁有此活動的票券' },
                { status: 400 }
            );
        }

        // 7. Perform transfer - update ticket ownership
        const { error: updateError } = await supabase
            .from('registrations')
            .update({
                user_id: recipientId,
                transferred_from: currentUserId,
                transferred_at: new Date().toISOString(),
                // Generate new check-in code for security
                checkin_code: generateCheckinCode(),
            })
            .eq('id', ticketId);

        if (updateError) {
            console.error('Transfer error:', updateError);
            return NextResponse.json(
                { error: '轉送失敗，請稍後重試' },
                { status: 500 }
            );
        }

        // 8. TODO: Send notification email to recipient
        try {
            // Fetch sender details
            const { data: senderProfile } = await supabase
                .from('profiles')
                .select('full_name') // Assuming 'profiles' table has 'full_name'
                .eq('id', currentUserId)
                .single();

            const senderName = senderProfile?.full_name || '一位使用者';

            await sendTemplateEmail(recipientEmail, 'ticket_transfer_received', {
                ticketName: '專屬票券', // 簡化：不額外查詢票種名稱
                eventTitle: ticket.events?.title || '活動',
                senderName: senderName,
            });
        } catch (emailError) {
            console.error('Failed to send transfer email:', emailError);
            // Don't fail the request if email fails, just log it
        }

        return NextResponse.json({
            success: true,
            message: '票券轉送成功',
            recipientEmail,
        });

    } catch (error) {
        console.error('Ticket transfer error:', error);
        return NextResponse.json(
            { error: '系統錯誤，請稍後重試' },
            { status: 500 }
        );
    }
}

import { sendTemplateEmail } from '@/lib/email';

// Generate a unique check-in code
function generateCheckinCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
