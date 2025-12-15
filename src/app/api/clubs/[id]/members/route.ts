import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
    params: Promise<{ id: string }>;
}

// GET /api/clubs/[id]/members - 獲取成員列表
export async function GET(request: NextRequest, { params }: Params) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('club_members')
        .select(`
            *,
            user:profiles!club_members_user_id_fkey(id, full_name, avatar_url, email)
        `)
        .eq('club_id', id)
        .order('joined_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
