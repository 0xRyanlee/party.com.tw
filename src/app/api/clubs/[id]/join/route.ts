import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
    params: Promise<{ id: string }>;
}

// POST /api/clubs/[id]/join - 加入 Club
export async function POST(request: NextRequest, { params }: Params) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 檢查 Club 是否存在且為公開
    const { data: club } = await supabase
        .from('clubs')
        .select('id, club_type, is_active')
        .eq('id', id)
        .single();

    if (!club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    if (!club.is_active) {
        return NextResponse.json({ error: 'Club is not active' }, { status: 400 });
    }

    if (club.club_type === 'private') {
        return NextResponse.json({ error: 'This is a private club. Application required.' }, { status: 403 });
    }

    // 檢查是否已是成員
    const { data: existing } = await supabase
        .from('club_members')
        .select('id')
        .eq('club_id', id)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    // 加入 Club
    const { data, error } = await supabase
        .from('club_members')
        .insert({
            club_id: id,
            user_id: user.id,
            role: 'member',
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
