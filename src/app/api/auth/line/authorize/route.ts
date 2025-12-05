import { NextRequest, NextResponse } from 'next/server';

/**
 * Line Login - Step 1: Redirect to Line Authorization
 * GET /api/auth/line/authorize
 */
export async function GET(request: NextRequest) {
    const lineChannelId = process.env.LINE_CHANNEL_ID;
    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/line/callback`;

    if (!lineChannelId) {
        return NextResponse.json(
            { error: 'Line Channel ID not configured' },
            { status: 500 }
        );
    }

    // Line OAuth authorization URL
    const authUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', lineChannelId);
    authUrl.searchParams.set('redirect_uri', callbackUrl);
    authUrl.searchParams.set('state', generateRandomState());
    authUrl.searchParams.set('scope', 'profile openid'); // 移除 email 避免驗證碼

    return NextResponse.redirect(authUrl.toString());
}

function generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
