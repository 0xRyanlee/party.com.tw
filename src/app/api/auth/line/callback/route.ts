import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Line Login - Step 2: Handle callback and exchange code for token
 * GET /api/auth/line/callback
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}?error=line_auth_failed`);
    }

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}?error=missing_code`);
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/line/callback`,
                client_id: process.env.LINE_CHANNEL_ID!,
                client_secret: process.env.LINE_CHANNEL_SECRET!,
            }),
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();
        const { access_token, id_token } = tokenData;

        // Get user profile
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to fetch user profile');
        }

        const profile = await profileResponse.json();
        const { userId, displayName, pictureUrl, statusMessage } = profile;

        // Create or update user in Supabase
        const supabase = await createClient();

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('line_user_id', userId)
            .single();

        if (existingUser) {
            // User exists, sign them in
            // Note: This is a simplified version. In production, you'd want to:
            // 1. Create a custom JWT token
            // 2. Set it as a session cookie
            // 3. Or use Supabase's signInWithIdToken if available

            // For now, redirect to home with success
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}?line_login=success`);
        } else {
            // Create new user
            const { data: newUser, error: createError } = await supabase
                .from('profiles')
                .insert({
                    line_user_id: userId,
                    full_name: displayName,
                    avatar_url: pictureUrl,
                    email: null, // Line doesn't always provide email
                })
                .select()
                .single();

            if (createError) {
                throw createError;
            }

            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}?line_login=success&new_user=true`);
        }

    } catch (error: any) {
        console.error('Line OAuth error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}?error=line_auth_error`);
    }
}
