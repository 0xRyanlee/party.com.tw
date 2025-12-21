import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - 獲取里程碑列表
export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('milestones')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ milestones: data });
    } catch (error) {
        console.error('Get milestones error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - 創建里程碑
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { title, description, category, target_value } = body;

        if (!title) {
            return NextResponse.json({ error: '缺少標題' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('milestones')
            .insert({
                title,
                description,
                category: category || 'user',
                target_value: target_value || 1,
                current_value: 0,
                is_completed: false,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ milestone: data });
    } catch (error) {
        console.error('Create milestone error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - 更新里程碑
export async function PUT(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
        }

        // 如果標記完成，設置完成時間
        if (updates.is_completed && !updates.completed_at) {
            updates.completed_at = new Date().toISOString();
        } else if (updates.is_completed === false) {
            updates.completed_at = null;
        }

        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('milestones')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ milestone: data });
    } catch (error) {
        console.error('Update milestone error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - 刪除里程碑
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
        }

        const { error } = await supabase
            .from('milestones')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete milestone error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
