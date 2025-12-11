import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Line Login - Step 2: Handle callback and exchange code for token
 * GET /api/auth/line/callback
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    console.log('🔵 LINE callback triggered');
    console.log('🔑 Code present:', code ? 'YES' : 'NO');

    if (error) {
        console.error('❌ LINE auth error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}?error=line_auth_failed`);
    }

    if (!code) {
        console.error('❌ Missing code');
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}?error=missing_code`);
    }

    try {
        // 1. Exchange code for access token
        console.log('📡 Exchanging code for token...');
        const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/line/callback`,
                client_id: process.env.LINE_CHANNEL_ID!,
                client_secret: process.env.LINE_CHANNEL_SECRET!,
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error('❌ Token exchange failed:', errorData);
            throw new Error('Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();
        const { access_token } = tokenData;
        console.log('✅ Got access token');

        // 2. Get user profile
        console.log('👤 Fetching user profile...');
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to fetch user profile');
        }

        const profile = await profileResponse.json();
        const { userId, displayName, pictureUrl } = profile;
        console.log('✅ Got user profile:', displayName);

        // 3. Create Supabase client
        const supabase = await createClient();

        // 4. 使用 LINE user ID 作為唯一標識創建/登入用戶
        const email = `${userId}@line.party.com.tw`;
        const password = userId; // 使用 LINE user ID 作為密碼

        console.log('🔐 Attempting Supabase auth...');

        // 嘗試登入
        let { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        // 如果用戶不存在，創建新用戶
        if (signInError?.message.includes('Invalid login credentials')) {
            console.log('📝 Creating new user...');
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: displayName,
                        avatar_url: pictureUrl,
                        line_user_id: userId,
                        provider: 'line',
                    },
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}`,
                },
            });

            if (signUpError) {
                console.error('❌ Sign up error:', signUpError);
                throw signUpError;
            }
            authData = signUpData as any;
            console.log('✅ New user created');
        } else if (signInError) {
            console.error('❌ Sign in error:', signInError);
            throw signInError;
        } else {
            console.log('✅ User signed in');
        }

        // 5. 更新或創建 profile
        if (authData.user) {
            console.log('💾 Updating profile...');
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    full_name: displayName,
                    avatar_url: pictureUrl,
                    line_user_id: userId,
                    updated_at: new Date().toISOString(),
                });

            if (profileError) {
                console.error('⚠️  Profile update error:', profileError);
                // 不拋出錯誤，因為主要的認證已經成功
            } else {
                console.log('✅ Profile updated');
            }
        }

        // 6. 重定向到首頁
        console.log('🎯 Redirecting to home...');
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}`);

    } catch (error: any) {
        console.error('❌ LINE OAuth error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}?error=line_auth_error`);
    }
}
