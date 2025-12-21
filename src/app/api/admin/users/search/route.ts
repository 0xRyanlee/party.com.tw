import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const tier = searchParams.get('tier');
        const limit = parseInt(searchParams.get('limit') || '20');

        let dbQuery = supabase
            .from('profiles')
            .select(`
                id,
                display_name,
                email,
                avatar_url,
                role,
                created_at
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        // 搜索過濾
        if (query) {
            dbQuery = dbQuery.or(`display_name.ilike.%${query}%,email.ilike.%${query}%`);
        }

        // 角色過濾
        if (tier === 'kol') {
            dbQuery = dbQuery.eq('role', 'kol');
        } else if (tier === 'vendor') {
            dbQuery = dbQuery.eq('role', 'vendor');
        }

        const { data: users, error } = await dbQuery;

        if (error) {
            console.error('User search error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 獲取用戶會員等級（如果 user_tiers 表存在）
        const usersWithTier = await Promise.all(
            (users || []).map(async (user) => {
                try {
                    const { data: tierData } = await supabase
                        .from('user_tiers')
                        .select('tier, expires_at')
                        .eq('user_id', user.id)
                        .single();

                    return {
                        ...user,
                        tier: tierData?.tier || 'free',
                        tier_expires_at: tierData?.expires_at || null,
                    };
                } catch {
                    return { ...user, tier: 'free', tier_expires_at: null };
                }
            })
        );

        return NextResponse.json({
            users: usersWithTier,
            total: usersWithTier.length,
        });
    } catch (error) {
        console.error('User search error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
