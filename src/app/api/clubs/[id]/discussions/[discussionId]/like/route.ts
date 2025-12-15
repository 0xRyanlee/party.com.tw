import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
    params: Promise<{ id: string; discussionId: string }>;
}

// POST /api/clubs/[id]/discussions/[discussionId]/like - 按讚/取消按讚
export async function POST(request: NextRequest, { params }: Params) {
    const { discussionId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 檢查是否已按讚
    const { data: existing } = await supabase
        .from('club_discussion_likes')
        .select('id')
        .eq('discussion_id', discussionId)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        // 取消按讚
        const { error } = await supabase
            .from('club_discussion_likes')
            .delete()
            .eq('id', existing.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ liked: false });
    } else {
        // 按讚
        const { error } = await supabase
            .from('club_discussion_likes')
            .insert({
                discussion_id: discussionId,
                user_id: user.id,
            });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ liked: true });
    }
}
