import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
    params: Promise<{ id: string }>;
}

// POST /api/clubs/[id]/leave - 離開 Club
export async function POST(request: NextRequest, { params }: Params) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 檢查是否為成員
    const { data: membership } = await supabase
        .from('club_members')
        .select('id, role')
        .eq('club_id', id)
        .eq('user_id', user.id)
        .single();

    if (!membership) {
        return NextResponse.json({ error: 'Not a member' }, { status: 400 });
    }

    // Owner 不能離開（需要先轉移所有權或刪除 Club）
    if (membership.role === 'owner') {
        return NextResponse.json({
            error: 'Owner cannot leave. Transfer ownership or delete the club.'
        }, { status: 400 });
    }

    // 離開 Club
    const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('id', membership.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
