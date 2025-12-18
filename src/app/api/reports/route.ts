import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // 驗證必要欄位
        const { reportType, category, content, contactEmail, targetEventId, targetUserId } = body;

        if (!reportType || !category || !content) {
            return NextResponse.json(
                { error: '缺少必要欄位' },
                { status: 400 }
            );
        }

        if (content.length < 10) {
            return NextResponse.json(
                { error: '內容至少需要 10 個字' },
                { status: 400 }
            );
        }

        // 獲取當前用戶（可選）
        const { data: { user } } = await supabase.auth.getUser();

        // 創建報告
        const { data: report, error } = await supabase
            .from('reports')
            .insert({
                report_type: reportType,
                category,
                content,
                contact_email: contactEmail || null,
                reporter_id: user?.id || null,
                target_event_id: targetEventId || null,
                target_user_id: targetUserId || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating report:', error);
            return NextResponse.json(
                { error: '提交失敗', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ report }, { status: 201 });

    } catch (error: unknown) {
        console.error('Unexpected error in POST /api/reports:', error);
        return NextResponse.json(
            { error: '伺服器錯誤' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        // 驗證用戶
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: '請先登入' },
                { status: 401 }
            );
        }

        // 查詢參數
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit') || '20');

        // 構建查詢
        let query = supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (status) {
            query = query.eq('status', status);
        }

        if (type) {
            query = query.eq('report_type', type);
        }

        const { data: reports, error } = await query;

        if (error) {
            console.error('Error fetching reports:', error);
            return NextResponse.json(
                { error: '獲取失敗', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ reports }, {
            status: 200,
            headers: {
                'Cache-Control': 'private, no-cache',
            }
        });

    } catch (error: unknown) {
        console.error('Unexpected error in GET /api/reports:', error);
        return NextResponse.json(
            { error: '伺服器錯誤' },
            { status: 500 }
        );
    }
}
