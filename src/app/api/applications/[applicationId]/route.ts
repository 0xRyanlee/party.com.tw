import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTemplateEmail } from '@/lib/email';

/**
 * PATCH /api/applications/[applicationId]
 * 更新申請狀態（通過/拒絕）- 僅限活動組織者
 */
export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ applicationId: string }> }
) {
    const params = await props.params;
    const supabase = await createClient();
    const { applicationId } = params;

    try {
        const body = await request.json();
        const { status } = body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // 驗證用戶
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 獲取申請詳情
        const { data: application, error: appError } = await supabase
            .from('applications')
            .select('*, event:events(organizer_id)')
            .eq('id', applicationId)
            .single();

        if (appError || !application) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        // 檢查權限（僅活動組織者可更新）
        if (application.event.organizer_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 更新申請狀態
        const { data, error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', applicationId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        // 發送通知給申請者
        if (application.email) {
            const template = status === 'approved' ? 'application_approved' : 'application_rejected';
            sendTemplateEmail(application.email, template, {
                eventTitle: '活動',
                roleName: application.role_name || '參與者',
            }).catch(err => console.error('Email send failed:', err));
        }

        return NextResponse.json({ application: data });
    } catch (error: any) {
        console.error('Error updating application:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update application' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/applications/[applicationId]
 * 刪除申請（撤回申請）- 僅限申請者本人
 */
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ applicationId: string }> }
) {
    const params = await props.params;
    const supabase = await createClient();
    const { applicationId } = params;

    try {
        // 驗證用戶
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 檢查並刪除
        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', applicationId)
            .eq('user_id', user.id); // 僅能刪除自己的申請

        if (error) {
            throw error;
        }

        return NextResponse.json({ message: 'Application deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting application:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete application' },
            { status: 500 }
        );
    }
}
