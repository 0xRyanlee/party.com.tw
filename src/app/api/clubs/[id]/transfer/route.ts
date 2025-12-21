import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = {
    params: Promise<{ id: string }>;
};

// POST /api/clubs/[id]/transfer - 轉讓俱樂部所有權
export async function POST(request: NextRequest, { params }: Params) {
    const { id } = await params;
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

    // 驗證俱樂部存在且當前用戶是負責人
    const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('id, owner_id, name')
        .eq('id', id)
        .single();

    if (clubError || !club) {
        return NextResponse.json({ error: '俱樂部不存在' }, { status: 404 });
    }

    if (club.owner_id !== user.id) {
        return NextResponse.json({ error: '您不是此俱樂部的負責人' }, { status: 403 });
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

    // 檢查新負責人的會員權限（俱樂部需要 Plus 會員）
    const { data: newOwnerProfile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', newOwnerId)
        .single();

    // 暫時跳過會員檢查，允許所有用戶接手
    // if (newOwnerProfile?.tier !== 'plus' && newOwnerProfile?.tier !== 'pro') {
    //     return NextResponse.json({ 
    //         error: '無法移交俱樂部：對方尚未升級為 Plus 會員',
    //         reason: 'membership_required'
    //     }, { status: 403 });
    // }

    // 開始事務：更新俱樂部負責人 + 成員角色
    // 1. 更新俱樂部負責人
    const { error: updateClubError } = await supabase
        .from('clubs')
        .update({ owner_id: newOwnerId })
        .eq('id', id);

    if (updateClubError) {
        console.error('Club transfer error:', updateClubError);
        return NextResponse.json({ error: '轉讓失敗' }, { status: 500 });
    }

    // 2. 更新成員角色：舊負責人變成管理員，新負責人變成 owner
    // 先把舊負責人改成 admin
    await supabase
        .from('club_members')
        .update({ role: 'admin' })
        .eq('club_id', id)
        .eq('user_id', user.id);

    // 檢查新負責人是否已是成員
    const { data: existingMember } = await supabase
        .from('club_members')
        .select('id')
        .eq('club_id', id)
        .eq('user_id', newOwnerId)
        .single();

    if (existingMember) {
        // 已是成員，升級為 owner
        await supabase
            .from('club_members')
            .update({ role: 'owner' })
            .eq('club_id', id)
            .eq('user_id', newOwnerId);
    } else {
        // 不是成員，新增為 owner
        await supabase
            .from('club_members')
            .insert({
                club_id: id,
                user_id: newOwnerId,
                role: 'owner',
            });
    }

    return NextResponse.json({
        success: true,
        message: `俱樂部「${club.name}」已成功轉讓給 ${newOwner.full_name || '新負責人'}`,
    });
}
