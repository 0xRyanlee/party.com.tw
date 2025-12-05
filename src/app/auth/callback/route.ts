import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/';

    console.log('🔐 Auth callback triggered');
    console.log('📍 Request URL:', requestUrl.toString());
    console.log('🔑 Code present:', code ? 'YES' : 'NO');
    console.log('➡️  Next path:', next);

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('❌ Auth callback error:', error);
            return NextResponse.redirect(new URL('/?error=auth_failed', requestUrl.origin));
        }

        console.log('✅ Auth successful');
        console.log('👤 User:', data.user?.email);
    }

    // 確保 next 是有效的路徑
    const redirectPath = next.startsWith('/') ? next : '/';
    const redirectUrl = new URL(redirectPath, requestUrl.origin);

    console.log('🎯 Redirecting to:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
}
