import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - 獲取版本更新列表
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const publishedOnly = searchParams.get('published') === 'true';

        let query = supabase
            .from('version_updates')
            .select('*')
            .order('created_at', { ascending: false });

        if (publishedOnly) {
            query = query.eq('is_published', true);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ versions: data });
    } catch (error) {
        console.error('Get versions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - 創建版本更新
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { version, title, description, type, is_published } = body;

        if (!version || !title) {
            return NextResponse.json({ error: '缺少版本號或標題' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('version_updates')
            .insert({
                version,
                title,
                description,
                type: type || 'feature',
                is_published: is_published || false,
                published_at: is_published ? new Date().toISOString() : null,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ version: data });
    } catch (error) {
        console.error('Create version error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - 更新版本
export async function PUT(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
        }

        // 如果設置為發布，更新發布時間
        if (updates.is_published && !updates.published_at) {
            updates.published_at = new Date().toISOString();
        }

        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('version_updates')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ version: data });
    } catch (error) {
        console.error('Update version error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - 刪除版本
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
        }

        const { error } = await supabase
            .from('version_updates')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete version error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
