import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/events/[eventId]/roles
 * 為活動創建或更新角色需求
 */
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ eventId: string }> }
) {
    const params = await props.params;
    const supabase = await createClient();
    const { eventId } = params;

    try {
        const body = await request.json();
        const { roles } = body; // Array of role objects

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

        // 刪除舊的角色（如果是更新操作）
        await supabase.from('event_roles').delete().eq('event_id', eventId);

        // 插入新角色
        if (roles && roles.length > 0) {
            const roleData = roles.map((role: any) => ({
                event_id: eventId,
                role_type: role.roleType,
                count_needed: role.countNeeded || 1,
                budget_min: role.budgetMin,
                budget_max: role.budgetMax,
                description: role.description,
                status: role.status || 'open',
            }));

            const { data, error } = await supabase
                .from('event_roles')
                .insert(roleData)
                .select();

            if (error) {
                throw error;
            }

            return NextResponse.json({ roles: data }, { status: 201 });
        }

        return NextResponse.json({ roles: [] }, { status: 200 });
    } catch (error: any) {
        console.error('Error creating event roles:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create roles' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/events/[eventId]/roles
 * 獲取活動的角色需求列表
 */
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ eventId: string }> }
) {
    const params = await props.params;
    const supabase = await createClient();
    const { eventId } = params;

    try {
        const { data, error } = await supabase
            .from('event_roles')
            .select('*')
            .eq('event_id', eventId)
            .eq('status', 'open')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ roles: data || [] });
    } catch (error: any) {
        console.error('Error fetching event roles:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch roles' },
            { status: 500 }
        );
    }
}
