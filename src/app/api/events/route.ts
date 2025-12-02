import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // 驗證用戶登入狀態
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login to create events.' },
                { status: 401 }
            );
        }

        // 解析請求 body
        const body = await request.json();

        // 驗證必要欄位
        const requiredFields = ['title', 'descriptionLong', 'category', 'startTime', 'endTime', 'venueName', 'address'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // 準備活動資料
        const eventData = {
            organizer_id: user.id,
            title: body.title,
            subtitle: body.subtitle || null,
            description_short: body.descriptionShort || body.descriptionLong.substring(0, 200),
            description_long: body.descriptionLong,
            category: body.category,
            cover_image: body.coverImage || null,

            // 時間
            start_time: body.startTime,
            end_time: body.endTime,
            timezone: body.timezone || 'Asia/Taipei',

            // 地點
            venue_name: body.venueName,
            address: body.address,
            city: body.city || null,
            country: body.country || 'Taiwan',
            gps_lat: body.gpsLat || null,
            gps_lng: body.gpsLng || null,

            // 票務
            ticket_types: body.ticketTypes || [],
            capacity_total: body.capacityTotal || null,
            capacity_remaining: body.capacityTotal || null,
            allow_waitlist: body.allowWaitlist || false,

            // 參與設定
            is_adult_only: body.isAdultOnly || false,
            invitation_only: body.invitationOnly || false,
            invitation_code: body.invitationCode || null,

            // 標籤
            tags: body.tags || [],

            // 狀態
            status: body.status || 'draft',
            language: body.language || 'zh',

            // 主辦方資訊（從用戶資料獲取）
            organizer_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
            organizer_avatar: user.user_metadata?.avatar_url || null,
            organizer_verified: false,
        };

        // 創建活動
        const { data: event, error: createError } = await supabase
            .from('events')
            .insert(eventData)
            .select()
            .single();

        if (createError) {
            console.error('Error creating event:', createError);
            return NextResponse.json(
                { error: 'Failed to create event', details: createError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ event }, { status: 201 });

    } catch (error: any) {
        console.error('Unexpected error in POST /api/events:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        // 查詢參數
        const status = searchParams.get('status') || 'published';
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // 構建查詢
        let query = supabase
            .from('events')
            .select('*')
            .eq('status', status)
            .order('start_time', { ascending: true })
            .range(offset, offset + limit - 1);

        if (category) {
            query = query.eq('category', category);
        }

        const { data: events, error } = await query;

        if (error) {
            console.error('Error fetching events:', error);
            return NextResponse.json(
                { error: 'Failed to fetch events', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ events }, { status: 200 });

    } catch (error: any) {
        console.error('Unexpected error in GET /api/events:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
