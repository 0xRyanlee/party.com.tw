import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        // Get admin password from environment variable
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            return NextResponse.json(
                { success: false, error: 'Admin password not configured' },
                { status: 500 }
            );
        }

        // Verify password
        if (password === adminPassword) {
            // Create response with success
            const response = NextResponse.json({ success: true });

            // Set HTTP-only cookie for session
            response.cookies.set('admin-session', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            });

            return response;
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid password' },
                { status: 401 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Invalid request' },
            { status: 400 }
        );
    }
}
