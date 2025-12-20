import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

/**
 * POST /api/tickets/transfer-link
 * Generate a one-time transfer link for a ticket
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
        const { ticketId } = body;

        if (!ticketId) {
            return NextResponse.json({ error: '缺少票券 ID' }, { status: 400 });
        }

        // Verify user owns this ticket
        const { data: registration, error: regError } = await supabase
            .from('registrations')
            .select('id, event_id, user_id, status')
            .eq('id', ticketId)
            .single();

        if (regError || !registration) {
            return NextResponse.json({ error: '找不到該票券' }, { status: 404 });
        }

        if (registration.user_id !== user.id) {
            return NextResponse.json({ error: '您無權轉送此票券' }, { status: 403 });
        }

        if (registration.status !== 'confirmed') {
            return NextResponse.json({ error: '此票券狀態無法轉送' }, { status: 400 });
        }

        // Generate a unique transfer token
        const transferToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store the transfer token (using registration metadata or a separate table)
        const { error: updateError } = await supabase
            .from('registrations')
            .update({
                transfer_token: transferToken,
                transfer_expires_at: expiresAt.toISOString(),
            })
            .eq('id', ticketId);

        if (updateError) {
            console.error('Update error:', updateError);
            return NextResponse.json({ error: '生成連結失敗' }, { status: 500 });
        }

        // Generate the transfer URL
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3000';
        const transferUrl = `${baseUrl}/wallet/claim?token=${transferToken}`;

        return NextResponse.json({
            transferUrl,
            expiresAt: expiresAt.toISOString(),
        });

    } catch (error: any) {
        console.error('Transfer link error:', error);
        return NextResponse.json({ error: error.message || '系統錯誤' }, { status: 500 });
    }
}
