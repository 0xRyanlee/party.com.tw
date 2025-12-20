import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

// GET /api/clubs/[id]/events - 獲取 Club 活動列表
export async function GET(request: NextRequest, { params }: Params) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('club_id', id)
        .eq('status', 'published')
        .order('start_time', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
}
