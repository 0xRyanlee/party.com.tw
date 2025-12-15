import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
    params: Promise<{ id: string }>;
}

// GET /api/clubs/[id] - 獲取單個 Club
export async function GET(request: NextRequest, { params }: Params) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('clubs')
        .select(`
            *,
            owner:profiles!clubs_owner_id_fkey(id, full_name, avatar_url, email)
        `)
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // 獲取當前用戶的成員資格
    const { data: { user } } = await supabase.auth.getUser();
    let membership = null;

    if (user) {
        const { data: memberData } = await supabase
            .from('club_members')
            .select('*')
            .eq('club_id', id)
            .eq('user_id', user.id)
            .single();

        membership = memberData;
    }

    return NextResponse.json({ ...data, membership });
}

// PATCH /api/clubs/[id] - 更新 Club
export async function PATCH(request: NextRequest, { params }: Params) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 驗證權限
    const { data: club } = await supabase
        .from('clubs')
        .select('owner_id')
        .eq('id', id)
        .single();

    if (!club || club.owner_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = ['name', 'description', 'cover_image', 'club_type', 'tags', 'is_active'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            updates[field] = body[field];
        }
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('clubs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// DELETE /api/clubs/[id] - 刪除 Club
export async function DELETE(request: NextRequest, { params }: Params) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 驗證權限
    const { data: club } = await supabase
        .from('clubs')
        .select('owner_id')
        .eq('id', id)
        .single();

    if (!club || club.owner_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
