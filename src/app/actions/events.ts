"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type RegistrationResult = {
    success: boolean;
    message: string;
    status?: 'pending' | 'confirmed' | 'cancelled';
    checkin_code?: string;
};

export async function registerForEvent(eventId: string): Promise<RegistrationResult> {
    const supabase = await createClient();

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: "Please sign in to register." };
    }

    // 2. Check if already registered
    const { data: existing } = await supabase
        .from('registrations')
        .select('status')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        return { success: false, message: "You are already registered for this event.", status: existing.status };
    }

    // 3. Create Registration
    const { error } = await supabase
        .from('registrations')
        .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'confirmed', // Auto-confirm for free events
            ticket_type: 'general'
        });

    if (error) {
        console.error("Registration error:", error);
        return { success: false, message: "報名失敗，請稍後再試" };
    }

    // 4. Fetch the code we just created (since trigger handles it)
    const { data: regData } = await supabase
        .from('registrations')
        .select('checkin_code')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

    revalidatePath(`/events/${eventId}`);
    revalidatePath('/user/my-events');

    return {
        success: true,
        message: "Successfully registered!",
        status: 'confirmed',
        checkin_code: regData?.checkin_code
    };
}

export async function getUserRegistrations() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('registrations')
        .select(`
            *,
            event:events (
                id,
                title,
                date,
                time,
                location_name,
                image_url,
                price
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Fetch registrations error:", error);
        return [];
    }

    return data;
}

export async function checkRegistrationStatus(eventId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
        .from('registrations')
        .select('status')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

    return data?.status || null;
}

// Extended registration with attendee details
export type RegistrationFormData = {
    attendee_name: string;
    attendee_email: string;
    attendee_phone?: string;
    ticket_type_id?: string;
};

export async function registerWithDetails(
    eventId: string,
    formData: RegistrationFormData
): Promise<RegistrationResult> {
    const supabase = await createClient();

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: "請先登入才能報名" };
    }

    // 2. Check if already registered
    const { data: existing } = await supabase
        .from('registrations')
        .select('status')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        return { success: false, message: "您已經報名過此活動", status: existing.status };
    }

    // 3. Validate required fields
    if (!formData.attendee_name || !formData.attendee_email) {
        return { success: false, message: "請填寫姓名和 Email" };
    }

    // 4. Create Registration with attendee details
    const { error } = await supabase
        .from('registrations')
        .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'confirmed',
            attendee_name: formData.attendee_name,
            attendee_email: formData.attendee_email,
            attendee_phone: formData.attendee_phone || null,
            ticket_type_id: formData.ticket_type_id || null,
            registration_source: 'web',
        });

    if (error) {
        console.error("Registration error:", error);
        return { success: false, message: "報名失敗，請稍後再試" };
    }

    // 5. Fetch the code we just created (since trigger handles it)
    const { data: regData } = await supabase
        .from('registrations')
        .select('checkin_code')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

    revalidatePath(`/events/${eventId}`);
    revalidatePath('/user/my-events');

    return {
        success: true,
        message: "報名成功！",
        status: 'confirmed',
        checkin_code: regData?.checkin_code
    };
}
