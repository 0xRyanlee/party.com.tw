import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ eventId: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { eventId } = params;

        // 1. Authenticate User
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Body
        const body = await request.json();

        // 3. Fetch Existing Event to check ownership and tickets
        const { data: existingEvent, error: fetchError } = await supabase
            .from('events')
            .select('id, organizer_id, ticket_types, status, start_time, end_time, venue_name, address')
            .eq('id', eventId)
            .single();

        if (fetchError || !existingEvent) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Check Ownership
        if (existingEvent.organizer_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if Event is Locked (e.g. if Expired) - Logic Gap #4
        const isExpired = existingEvent.status === 'expired' || new Date(existingEvent.end_time) < new Date();
        if (isExpired) {
            // Critical fields that cannot be changed when expired
            const criticalFields = ['start_time', 'end_time', 'ticket_types', 'address', 'venue_name'];
            const changes = criticalFields.some(field => {
                // strict comparison might fail due to type/undefined, assume body has camelCase
                // mapping: start_time -> startTime. 
                // Let's check body fields directly against existing.
                // Simplified: if body[fieldName] is present and different.

                // Map snake to camel
                const camelMap: Record<string, string> = {
                    'start_time': 'startTime',
                    'end_time': 'endTime',
                    'ticket_types': 'ticketTypes',
                    'address': 'address',
                    'venue_name': 'venueName'
                };

                const bodyKey = camelMap[field];
                // Deep comparison for objects/arrays is hard here, loose check:
                const existing = existingEvent as any;
                if (body[bodyKey] && JSON.stringify(body[bodyKey]) !== JSON.stringify(existing[field])) {
                    return true;
                }
                return false;
            });

            if (changes) {
                return NextResponse.json({ error: 'Cannot edit critical fields (Time, Location, Tickets) of an expired event.' }, { status: 400 });
            }
        }

        // 4. Input Validation (Basic)
        if (!body.title || !body.startTime || !body.endTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 5. SAFETY CHECK: Prevent Deleting Sold Tickets (Logic Gap #2)
        const newTicketTypes = body.ticketTypes || [];
        const oldTicketTypes = (existingEvent.ticket_types as any[]) || [];

        // Identify deleted tickets (present in old but not in new)
        // Matching by ID if present, otherwise potentially problematic. 
        // Assuming tickets have 'id' property. If not, we skip this check or rely on name?
        // Let's assume they have IDs.

        const newTicketIds = new Set(newTicketTypes.map((t: any) => t.id).filter(Boolean));
        const deletedTickets = oldTicketTypes.filter((t: any) => t.id && !newTicketIds.has(t.id));

        if (deletedTickets.length > 0) {
            // Check sales for these deleted tickets
            const { count, error: countError } = await supabase
                .from('registrations')
                .select('*', { count: 'exact', head: true })
                .in('ticket_type_id', deletedTickets.map((t: any) => t.id))
                // Only count confirmed or valid registrations? 
                // Maybe 'status' in ('confirmed', 'waitlist', 'pending_payment')
                .neq('status', 'cancelled');

            if (count && count > 0) {
                return NextResponse.json(
                    { error: 'Cannot delete ticket types that have been sold. Please disable them instead.' },
                    { status: 400 }
                );
            }
        }

        // 6. Prepare Update Data
        const updateData = {
            title: body.title,
            subtitle: body.subtitle || null,
            description_short: body.descriptionShort, // Optional: Recalculate if not provided
            description_long: body.descriptionLong,
            category: body.category,
            cover_image: body.coverImage,
            venue_name: body.venueName,
            address: body.address,
            gps_lat: body.gpsLat,
            gps_lng: body.gpsLng,
            start_time: body.startTime,
            end_time: body.endTime,
            ticket_types: newTicketTypes,
            capacity_total: body.capacityTotal,
            // capacity_remaining should probably be recalculated or left as is?
            // If capacity changes, we need to adjust logic.
            // For now, let's update simple fields.
            is_adult_only: body.isAdultOnly,
            invitation_only: body.invitationOnly,
            invitation_code: body.invitationCode,
            tags: body.tags,
            external_link: body.externalLink,
            status: body.status, // Allow status update
            updated_at: new Date().toISOString(),
        };

        // 7. Perform Update
        const { data: updatedEvent, error: updateError } = await supabase
            .from('events')
            .update(updateData)
            .eq('id', eventId)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ event: updatedEvent });

    } catch (error: any) {
        console.error('Update event error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
