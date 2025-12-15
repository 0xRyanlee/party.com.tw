import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/clubs - 獲取 Club 列表
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type'); // public, private, vendor
    const search = searchParams.get('search');
    const my = searchParams.get('my'); // 'true' = 只顯示我的 Club

    let query = supabase
        .from('clubs')
        .select(`
            *,
            owner:profiles!clubs_owner_id_fkey(id, full_name, avatar_url)
        `)
        .eq('is_active', true)
        .order('member_count', { ascending: false });

    // 篩選類型
    if (type) {
        query = query.eq('club_type', type);
    }

    // 搜尋
    if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 我的 Club
    if (my === 'true') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // 先獲取用戶加入的 Club IDs
            const { data: memberships } = await supabase
                .from('club_members')
                .select('club_id')
                .eq('user_id', user.id);

            const clubIds = memberships?.map(m => m.club_id) || [];

            // 加上自己擁有的
            query = query.or(`owner_id.eq.${user.id},id.in.(${clubIds.join(',')})`);
        }
    }

    const { data, error } = await query.limit(50);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// POST /api/clubs - 創建 Club
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, cover_image, club_type = 'public', tags = [] } = body;

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // 創建 Club
    const { data: club, error: clubError } = await supabase
        .from('clubs')
        .insert({
            name,
            description,
            cover_image,
            club_type,
            tags,
            owner_id: user.id,
            member_count: 1, // Owner 算一個成員
        })
        .select()
        .single();

    if (clubError) {
        return NextResponse.json({ error: clubError.message }, { status: 500 });
    }

    // 自動將 owner 加入成員
    await supabase
        .from('club_members')
        .insert({
            club_id: club.id,
            user_id: user.id,
            role: 'owner',
        });

    return NextResponse.json(club, { status: 201 });
}
