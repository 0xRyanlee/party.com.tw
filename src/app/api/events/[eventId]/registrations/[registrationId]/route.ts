import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendTemplateEmail } from '@/lib/email';

// DELETE /api/events/[eventId]/registrations/[registrationId] - Cancel a registration
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ eventId: string; registrationId: string }> }
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

        // Get registration
        const { data: registration, error: fetchError } = await supabase
            .from('registrations')
            .select('*, events(organizer_id)')
            .eq('id', params.registrationId)
            .eq('event_id', params.eventId)
            .single();

        if (fetchError || !registration) {
            return NextResponse.json(
                { error: 'Registration not found' },
                { status: 404 }
            );
        }

        // Check if user is the registrant or event organizer
        const isOwner = registration.user_id === user.id;
        const isOrganizer = registration.events?.organizer_id === user.id;

        if (!isOwner && !isOrganizer) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Update status to cancelled instead of deleting
        const { error: updateError } = await supabase
            .from('registrations')
            .update({ status: 'cancelled' })
            .eq('id', params.registrationId);

        if (updateError) {
            console.error('Cancel registration error:', updateError);
            return NextResponse.json(
                { error: 'Failed to cancel registration' },
                { status: 500 }
            );
        }

        // 發送取消郵件
        if (registration.attendee_email) {
            sendTemplateEmail(registration.attendee_email, 'registration_cancelled', {
                eventTitle: '活動',
            }).catch(err => console.error('Email send failed:', err));
        }

        return NextResponse.json({
            message: 'Registration cancelled successfully',
        });

    } catch (error) {
        console.error('Cancel registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH /api/events/[eventId]/registrations/[registrationId] - Update registration (check-in, approve, etc.)
export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ eventId: string; registrationId: string }> }
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

        // Get registration
        const { data: registration, error: fetchError } = await supabase
            .from('registrations')
            .select('*, events(organizer_id)')
            .eq('id', params.registrationId)
            .eq('event_id', params.eventId)
            .single();

        if (fetchError || !registration) {
            return NextResponse.json(
                { error: 'Registration not found' },
                { status: 404 }
            );
        }

        // Only organizer can update registrations
        if (registration.events?.organizer_id !== user.id) {
            return NextResponse.json(
                { error: 'Forbidden: Only event organizer can update registrations' },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { action, ...updates } = body;

        let updateData: any = {};

        if (action === 'checkin') {
            updateData = {
                checked_in: true,
                checked_in_at: new Date().toISOString(),
                checked_in_by: user.id,
            };
        } else if (action === 'approve') {
            updateData = { status: 'confirmed' };
        } else if (action === 'reject') {
            updateData = { status: 'rejected' };
        } else {
            // Allow direct updates
            updateData = updates;
        }

        // Update registration
        const { data: updated, error: updateError } = await supabase
            .from('registrations')
            .update(updateData)
            .eq('id', params.registrationId)
            .select()
            .single();

        if (updateError) {
            console.error('Update registration error:', updateError);
            return NextResponse.json(
                { error: 'Failed to update registration' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            registration: updated,
            message: 'Registration updated successfully',
        });

    } catch (error) {
        console.error('Update registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
