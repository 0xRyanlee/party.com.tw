"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type RegistrationResult = {
    success: boolean;
    message: string;
    status?: 'pending' | 'confirmed' | 'cancelled';
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
        return { success: false, message: "Failed to register. Please try again." };
    }

    // 4. Update Event Count (Optional: could be a trigger)
    // For MVP, we'll let the client revalidate or rely on a trigger if we added one.
    // Here we just revalidate the path to refresh UI
    revalidatePath(`/events/${eventId}`);
    revalidatePath('/user/my-events');

    return { success: true, message: "Successfully registered!", status: 'confirmed' };
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
