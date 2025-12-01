import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/applications
 * 提交申請（申請角色或資源）
 */
export async function POST(request: NextRequest) {
    const supabase = await createClient();

    try {
        const body = await request.json();

        // 驗證用戶
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 準備申請資料
        const applicationData = {
            event_id: body.eventId,
            user_id: user.id,
            target_role_id: body.targetRoleId || null,
            target_resource_id: body.targetResourceId || null,
            message: body.message,
            contact_info: body.contactInfo,
            status: 'pending',
        };

        // 檢查是否已申請過（防止重複申請）
        let duplicateCheckQuery = supabase
            .from('applications')
            .select('id')
            .eq('event_id', body.eventId)
            .eq('user_id', user.id);

        if (body.targetRoleId) {
            duplicateCheckQuery = duplicateCheckQuery.eq(
                'target_role_id',
                body.targetRoleId
            );
        }
        if (body.targetResourceId) {
            duplicateCheckQuery = duplicateCheckQuery.eq(
                'target_resource_id',
                body.targetResourceId
            );
        }

        const { data: existing } = await duplicateCheckQuery.single();

        if (existing) {
            return NextResponse.json(
                { error: 'You have already applied for this opportunity' },
                { status: 400 }
            );
        }

        // 創建申請
        const { data, error } = await supabase
            .from('applications')
            .insert([applicationData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ application: data }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating application:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create application' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/applications
 * 獲取當前用戶的申請列表
 */
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 可選篩選

    try {
        // 驗證用戶
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let query = supabase
            .from('applications')
            .select(
                `
        *,
        event:events(id, title, start_time, status),
        role:event_roles(id, role_type, budget_min, budget_max),
        resource:event_resources(id, resource_type, description)
      `
            )
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        return NextResponse.json({ applications: data || [] });
    } catch (error: any) {
        console.error('Error fetching applications:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch applications' },
            { status: 500 }
        );
    }
}
