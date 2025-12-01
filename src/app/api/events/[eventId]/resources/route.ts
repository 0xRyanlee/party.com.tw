import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/events/[eventId]/resources
 * 為活動創建或更新資源需求
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    const supabase = createClient();
    const { eventId } = params;

    try {
        const body = await request.json();
        const { resources } = body; // Array of resource objects

        // 驗證用戶權限
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 檢查用戶是否為活動組織者
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('organizer_id')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        if (event.organizer_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 刪除舊的資源（如果是更新操作）
        await supabase.from('event_resources').delete().eq('event_id', eventId);

        // 插入新資源
        if (resources && resources.length > 0) {
            const resourceData = resources.map((resource: any) => ({
                event_id: eventId,
                resource_type: resource.resourceType,
                description: resource.description,
                status: resource.status || 'open',
            }));

            const { data, error } = await supabase
                .from('event_resources')
                .insert(resourceData)
                .select();

            if (error) {
                throw error;
            }

            return NextResponse.json({ resources: data }, { status: 201 });
        }

        return NextResponse.json({ resources: [] }, { status: 200 });
    } catch (error: any) {
        console.error('Error creating event resources:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create resources' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/events/[eventId]/resources
 * 獲取活動的資源需求列表
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    const supabase = createClient();
    const { eventId } = params;

    try {
        const { data, error } = await supabase
            .from('event_resources')
            .select('*')
            .eq('event_id', eventId)
            .eq('status', 'open')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ resources: data || [] });
    } catch (error: any) {
        console.error('Error fetching event resources:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch resources' },
            { status: 500 }
        );
    }
}
