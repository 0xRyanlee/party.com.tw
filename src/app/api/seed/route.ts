import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Secret key for seeding - should match SEED_SECRET in .env.local
const SEED_SECRET = process.env.SEED_SECRET || 'party-seed-2024';

interface EventData {
    title: string;
    descriptionShort: string;
    descriptionLong: string;
    category: string;
    venueName: string;
    address: string;
    startTime: string;
    endTime: string;
    status: string;
    tags: string[];
    externalLink: string;
    coverImage: string;
}

export async function POST(request: Request) {
    try {
        // Check secret key
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== `Bearer ${SEED_SECRET}`) {
            return NextResponse.json({ error: 'Invalid seed secret' }, { status: 401 });
        }

        const body: EventData = await request.json();

        // Use service role key to bypass RLS for admin seeding
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY in env' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false }
        });

        // Extract date and time from start_time
        const startDate = new Date(body.startTime);
        const dateString = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeString = startDate.toTimeString().slice(0, 5); // HH:MM format

        // Use party.com.tw admin account as organizer for seeded events
        const SEED_ORGANIZER_ID = '26013254-0903-4a4d-921d-8478759ee68a';

        const { data, error } = await supabase
            .from('events')
            .insert({
                title: body.title,
                description_short: body.descriptionShort,
                description_long: `${body.descriptionLong}\n\n原始來源: ${body.externalLink}`,
                category: body.category,
                type: body.category,
                date: dateString,
                time: timeString,
                venue_name: body.venueName,
                location_name: body.venueName,
                address: body.address,
                start_time: body.startTime,
                end_time: body.endTime,
                status: body.status,
                tags: body.tags,
                cover_image: body.coverImage,
                organizer_id: SEED_ORGANIZER_ID,
            })
            .select()
            .single();

        if (error) {
            console.error('Seed insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ event: data });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
