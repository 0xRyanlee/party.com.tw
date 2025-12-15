import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
    params: Promise<{ id: string }>;
}

// GET /api/clubs/[id]/discussions - 獲取討論列表
export async function GET(request: NextRequest, { params }: Params) {
    const { id } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const parentId = searchParams.get('parent_id'); // null = 頂層貼文
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
        .from('club_discussions')
        .select(`
            *,
            author:profiles!club_discussions_author_id_fkey(id, full_name, avatar_url)
        `)
        .eq('club_id', id)
        .eq('is_hidden', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (parentId) {
        query = query.eq('parent_id', parentId);
    } else {
        query = query.is('parent_id', null); // 只獲取頂層貼文
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 檢查當前用戶是否按讚
    const { data: { user } } = await supabase.auth.getUser();
    if (user && data) {
        const discussionIds = data.map(d => d.id);
        const { data: likes } = await supabase
            .from('club_discussion_likes')
            .select('discussion_id')
            .eq('user_id', user.id)
            .in('discussion_id', discussionIds);

        const likedIds = new Set(likes?.map(l => l.discussion_id) || []);

        // 添加 liked 標記
        const dataWithLikes = data.map(d => ({
            ...d,
            liked: likedIds.has(d.id),
        }));

        return NextResponse.json(dataWithLikes);
    }

    return NextResponse.json(data);
}

// POST /api/clubs/[id]/discussions - 發布討論
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
        .select('id, nickname')
        .eq('club_id', id)
        .eq('user_id', user.id)
        .single();

    if (!membership) {
        return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const body = await request.json();
    const { content, display_mode = 'real', parent_id } = body;

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // 根據顯示模式設定顯示名稱
    let display_name = null;
    if (display_mode === 'nickname' && membership.nickname) {
        display_name = membership.nickname;
    } else if (display_mode === 'anonymous') {
        display_name = 'Anonymous';
    }

    const { data, error } = await supabase
        .from('club_discussions')
        .insert({
            club_id: id,
            author_id: user.id,
            content: content.trim(),
            display_mode,
            display_name,
            parent_id: parent_id || null,
        })
        .select(`
            *,
            author:profiles!club_discussions_author_id_fkey(id, full_name, avatar_url)
        `)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
