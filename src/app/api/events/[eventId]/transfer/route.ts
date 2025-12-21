import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = {
    params: Promise<{ eventId: string }>;
};

// POST /api/events/[eventId]/transfer - 轉讓活動所有權
export async function POST(request: NextRequest, { params }: Params) {
    const { eventId } = await params;
    const supabase = await createClient();

    // 驗證當前用戶
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    // 解析請求體
    const body = await request.json();
    const { newOwnerId } = body;

    if (!newOwnerId) {
        return NextResponse.json({ error: '請指定新負責人' }, { status: 400 });
    }

    // 驗證活動存在且當前用戶是負責人
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, host_id, title')
        .eq('id', eventId)
        .single();

    if (eventError || !event) {
        return NextResponse.json({ error: '活動不存在' }, { status: 404 });
    }

    if (event.host_id !== user.id) {
        return NextResponse.json({ error: '您不是此活動的負責人' }, { status: 403 });
    }

    // 驗證新負責人存在
    const { data: newOwner, error: newOwnerError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', newOwnerId)
        .single();

    if (newOwnerError || !newOwner) {
        return NextResponse.json({ error: '找不到指定的用戶' }, { status: 404 });
    }

    // 執行轉讓
    const { error: updateError } = await supabase
        .from('events')
        .update({ host_id: newOwnerId })
        .eq('id', eventId);

    if (updateError) {
        console.error('Transfer error:', updateError);
        return NextResponse.json({ error: '轉讓失敗' }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        message: `活動「${event.title}」已成功轉讓給 ${newOwner.full_name || '新負責人'}`,
    });
}
