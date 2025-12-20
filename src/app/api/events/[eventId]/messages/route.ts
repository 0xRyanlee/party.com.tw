import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
    params: Promise<{ eventId: string }>;
}

// GET /api/events/[eventId]/messages - 獲取聊天室訊息
export async function GET(request: NextRequest, { params }: Params) {
    const { eventId } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // cursor for pagination (message id)

    // Check access via RLS (will return empty if no access)
    let query = supabase
        .from('messages')
        .select(`
            id,
            event_id,
            user_id,
            content,
            content_type,
            metadata,
            created_at,
            author:profiles!messages_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (before) {
        // Get the timestamp of the cursor message for pagination
        const { data: cursorMsg } = await supabase
            .from('messages')
            .select('created_at')
            .eq('id', before)
            .single();

        if (cursorMsg) {
            query = query.lt('created_at', cursorMsg.created_at);
        }
    }

    const { data, error } = await query;

    if (error) {
        // RLS will block access - return appropriate error
        if (error.code === 'PGRST116') {
            return NextResponse.json({ error: '無法存取此聊天室' }, { status: 403 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return messages in chronological order (oldest first)
    return NextResponse.json((data || []).reverse());
}

// POST /api/events/[eventId]/messages - 發送訊息
export async function POST(request: NextRequest, { params }: Params) {
    const { eventId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const body = await request.json();
    const { content, content_type = 'text', metadata = {} } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: '訊息內容不可為空' }, { status: 400 });
    }

    if (content.length > 1000) {
        return NextResponse.json({ error: '訊息過長（最多 1000 字）' }, { status: 400 });
    }

    // Insert will fail via RLS if user doesn't have access
    const { data, error } = await supabase
        .from('messages')
        .insert({
            event_id: eventId,
            user_id: user.id,
            content: content.trim(),
            content_type,
            metadata,
        })
        .select(`
            id,
            event_id,
            user_id,
            content,
            content_type,
            metadata,
            created_at,
            author:profiles!messages_user_id_fkey(id, full_name, avatar_url)
        `)
        .single();

    if (error) {
        // RLS will block unauthorized inserts
        if (error.code === '42501') {
            return NextResponse.json({ error: '聊天室未開放或您沒有權限' }, { status: 403 });
        }
        console.error('Message insert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
