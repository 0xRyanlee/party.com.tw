import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST: 創建評論
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '請先登入' }, { status: 401 });
        }

        const body = await request.json();
        const { eventId, rating, title, content, isAnonymous } = body;

        if (!eventId || !rating) {
            return NextResponse.json({ error: '活動 ID 和評分為必填' }, { status: 400 });
        }

        // 創建評論
        const { data: review, error } = await supabase
            .from('reviews')
            .insert({
                event_id: eventId,
                reviewer_id: user.id,
                rating,
                title: title || null,
                content: content || null,
                is_anonymous: isAnonymous || false,
                review_type: 'event',
                status: 'approved',
            })
            .select()
            .single();

        if (error) {
            console.error('Create review error:', error);
            return NextResponse.json({ error: '創建失敗', details: error.message }, { status: 500 });
        }

        return NextResponse.json({ review, message: '評論已提交' });
    } catch (error) {
        console.error('Review error:', error);
        return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
    }
}

// GET: 獲取活動評論
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json({ error: '需要活動 ID' }, { status: 400 });
        }

        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
                id,
                rating,
                title,
                content,
                is_anonymous,
                created_at,
                reviewer:reviewer_id (
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .eq('event_id', eventId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch reviews error:', error);
            return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
        }

        // 處理匿名評論
        const processedReviews = reviews?.map(review => ({
            ...review,
            reviewer: review.is_anonymous ? null : review.reviewer,
        }));

        return NextResponse.json({ reviews: processedReviews });
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
    }
}
