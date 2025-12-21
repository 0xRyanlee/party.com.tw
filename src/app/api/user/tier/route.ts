import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - 獲取用戶會員等級
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            // 嘗試從 session 獲取
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return NextResponse.json({ tier: 'free', error: '未登入' });
            }

            const { data } = await supabase
                .from('user_tiers')
                .select('tier, subscription_status, subscription_end_date')
                .eq('user_id', user.id)
                .single();

            return NextResponse.json({
                tier: data?.tier || 'free',
                subscription_status: data?.subscription_status,
                subscription_end_date: data?.subscription_end_date,
            });
        }

        const { data } = await supabase
            .from('user_tiers')
            .select('tier, subscription_status, subscription_end_date')
            .eq('user_id', userId)
            .single();

        return NextResponse.json({
            tier: data?.tier || 'free',
            subscription_status: data?.subscription_status,
            subscription_end_date: data?.subscription_end_date,
        });
    } catch (error) {
        console.error('Get user tier error:', error);
        return NextResponse.json({ tier: 'free', error: 'Internal server error' });
    }
}
