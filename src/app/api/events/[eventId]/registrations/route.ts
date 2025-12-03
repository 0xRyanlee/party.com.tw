import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/events/[eventId]/registrations - Create a new registration
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ eventId: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get event details
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id, title, capacity_total, registered_count, status')
            .eq('id', params.eventId)
            .single();

        if (eventError || !event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        // Check if event is published
        if (event.status !== 'published') {
            return NextResponse.json(
                { error: 'Event is not published' },
                { status: 400 }
            );
        }

        // Check if user already registered
        const { data: existingRegistration } = await supabase
            .from('registrations')
            .select('id, status')
            .eq('event_id', params.eventId)
            .eq('user_id', user.id)
            .single();

        if (existingRegistration) {
            return NextResponse.json(
                { error: 'Already registered for this event' },
                { status: 400 }
            );
        }

        // Parse request body
        const body = await request.json();
        const {
            attendee_name,
            attendee_email,
            attendee_phone,
            ticket_type_id,
            questionnaire_answers,
        } = body;

        // Validate required fields
        if (!attendee_name || !attendee_email) {
            return NextResponse.json(
                { error: 'Attendee name and email are required' },
                { status: 400 }
            );
        }

        // Check capacity
        let status = 'confirmed';
        let waitlist_position = null;

        if (event.capacity_total && event.registered_count >= event.capacity_total) {
            status = 'waitlist';
            // Calculate waitlist position
            const { count } = await supabase
                .from('registrations')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', params.eventId)
                .eq('status', 'waitlist');
            waitlist_position = (count || 0) + 1;
        }

        // Create registration
        const { data: registration, error: createError } = await supabase
            .from('registrations')
            .insert({
                event_id: params.eventId,
                user_id: user.id,
                status,
                attendee_name,
                attendee_email,
                attendee_phone,
                ticket_type_id,
                questionnaire_answers: questionnaire_answers || {},
                waitlist_position,
                registration_source: 'web',
            })
            .select()
            .single();

        if (createError) {
            console.error('Registration creation error:', createError);
            return NextResponse.json(
                { error: 'Failed to create registration' },
                { status: 500 }
            );
        }

        // TODO: Send confirmation email

        return NextResponse.json({
            registration,
            message: status === 'waitlist'
                ? `You have been added to the waitlist (position ${waitlist_position})`
                : 'Registration successful!',
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET /api/events/[eventId]/registrations - Get all registrations for an event
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ eventId: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is the event organizer
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('organizer_id')
            .eq('id', params.eventId)
            .single();

        if (eventError || !event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        if (event.organizer_id !== user.id) {
            return NextResponse.json(
                { error: 'Forbidden: Only event organizer can view registrations' },
                { status: 403 }
            );
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query
        let query = supabase
            .from('registrations')
            .select('*', { count: 'exact' })
            .eq('event_id', params.eventId)
            .order('created_at', { ascending: false });

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.or(`attendee_name.ilike.%${search}%,attendee_email.ilike.%${search}%`);
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: registrations, error: fetchError, count } = await query;

        if (fetchError) {
            console.error('Fetch registrations error:', fetchError);
            return NextResponse.json(
                { error: 'Failed to fetch registrations' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            registrations,
            total: count,
            limit,
            offset,
        });

    } catch (error) {
        console.error('Get registrations error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
