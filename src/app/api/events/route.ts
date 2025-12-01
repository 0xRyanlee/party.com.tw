import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EventMVP } from '@/types/event-mvp';

/**
 * GET /api/events
 * 獲取活動列表，支援篩選和分頁
 */
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // 查詢參數
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'published';
    const vibeType = searchParams.get('vibeType');
    const city = searchParams.get('city');
    const category = searchParams.get('category');

    try {
        let query = supabase
            .from('events')
            .select('*', { count: 'exact' })
            .eq('status', status)
            .order('start_time', { ascending: true });

        // 可選篩選
        if (vibeType) {
            query = query.eq('vibe_type', vibeType);
        }
        if (city) {
            query = query.eq('city', city);
        }
        if (category) {
            query = query.eq('category', category);
        }

        // 分頁
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        return NextResponse.json({
            events: data,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error: any) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch events' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/events
 * 創建新活動，支援所有 MVP 欄位
 */
export async function POST(request: NextRequest) {
    const supabase = await createClient();

    try {
        const body = await request.json();

        // 獲取當前用戶
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Prepare event data with snake_case for database
        const eventData = {
            title: body.title,
            subtitle: body.subtitle || null,
            description_short: body.descriptionShort || body.description?.substring(0, 200) || null,
            description_long: body.descriptionLong || body.description || null,
            category: body.category || null,
            status: body.status || 'draft',
            language: body.language || 'zh',

            // Organizer (auto-populate from auth)
            organizer_id: user.id,
            organizer_name: body.organizerName || user.email?.split('@')[0] || 'Organizer',

            // Media
            cover_image: body.coverImage || null,

            // Time
            start_time: body.startTime,
            end_time: body.endTime || body.startTime, // Default to start time if not provided
            timezone: body.timezone || 'Asia/Taipei',

            // Location
            venue_name: body.venueName || null,
            address: body.address || null,
            city: body.city || null,
            country: body.country || 'Taiwan',
            gps_lat: body.gpsLat || null,
            gps_lng: body.gpsLng || null,

            // Tickets
            ticket_types: body.ticketTypes || [],
            ticket_sale_start: body.ticketSaleStart || null,
            ticket_sale_end: body.ticketSaleEnd || null,
            allow_waitlist: body.allowWaitlist || false,

            // Participant constraints (NEW SCHEMA)
            capacity_total: body.capacityTotal || null,
            capacity_remaining: body.capacityTotal || null,
            is_adult_only: body.isAdultOnly || false, // NEW: 18+ switch
            invitation_only: body.invitationOnly || false,
            invitation_code: body.invitationCode || null, // NEW: invitation code
            require_questionnaire: body.requireQuestionnaire || false,
            questionnaire_fields: body.questionnaireFields || [],

            // Tags (NEW: unified tag system)
            tags: body.tags || [], // NEW: replaces vibe_type, theme, mood_tags

            // Social
            event_rules: body.eventRules || null,
            allow_comment: body.allowComment !== false,
            attendee_list_visibility: body.attendeeListVisibility || 'public',

            // Interaction
            pre_event_chatroom: body.preEventChatroom || false,
            post_event_chatroom: body.postEventChatroom || false,

            // Rating
            rating_enabled: body.ratingEnabled !== false,

            // Extra
            include_meal: body.includeMeal || false,

            // Timestamps
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('events')
            .insert([eventData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ event: data }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating event:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create event' },
            { status: 500 }
        );
    }
}
