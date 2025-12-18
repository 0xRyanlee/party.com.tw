import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: 獲取當前用戶的 vendor profile
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '請先登入' }, { status: 401 });
        }

        const { data: profile, error } = await supabase
            .from('vendor_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching vendor profile:', error);
            return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
        }

        return NextResponse.json({ profile: profile || null });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
    }
}

// POST/PUT: 創建或更新 vendor profile
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '請先登入' }, { status: 401 });
        }

        const body = await request.json();

        // 準備資料
        const profileData = {
            user_id: user.id,
            display_name: body.displayName || '',
            bio: body.bio || '',
            location_name: body.location?.name || '',
            location_address: body.location?.address || '',
            location_lat: body.location?.lat || null,
            location_lng: body.location?.lng || null,
            categories: body.categories || [],
            cover_images: body.coverImages || [],
            contact_email: body.contact?.email || '',
            contact_phone: body.contact?.phone || '',
            contact_website: body.contact?.website || '',
            social_instagram: body.socialLinks?.instagram || '',
            social_linkedin: body.socialLinks?.linkedin || '',
            social_threads: body.socialLinks?.threads || '',
            services: body.services || [],
            portfolio: body.portfolio || [],
            pricing_min: body.pricing?.min ? parseInt(body.pricing.min) : null,
            pricing_max: body.pricing?.max ? parseInt(body.pricing.max) : null,
            pricing_currency: body.pricing?.currency || 'TWD',
        };

        // Upsert (insert or update)
        const { data: profile, error } = await supabase
            .from('vendor_profiles')
            .upsert(profileData, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) {
            console.error('Error saving vendor profile:', error);
            return NextResponse.json({ error: '儲存失敗', details: error.message }, { status: 500 });
        }

        return NextResponse.json({ profile, message: '儲存成功' }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
    }
}
