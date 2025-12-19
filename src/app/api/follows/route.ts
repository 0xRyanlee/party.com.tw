import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: '請先登入' }, { status: 401 });
        }

        const { followingId } = await request.json();

        if (!followingId) {
            return NextResponse.json({ error: '需要主辦方 ID' }, { status: 400 });
        }

        const { error } = await supabase
            .from('follows')
            .insert({
                follower_id: user.id,
                following_id: followingId,
            });

        if (error) {
            if (error.code === '23505') { // Duplicate unique key
                return NextResponse.json({ message: '已關注' });
            }
            console.error('Follow error:', error);
            return NextResponse.json({ error: '關注失敗', details: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: '關注成功' });
    } catch (error) {
        console.error('Follow API error:', error);
        return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: '請先登入' }, { status: 401 });
        }

        const { followingId } = await request.json();

        if (!followingId) {
            return NextResponse.json({ error: '需要主辦方 ID' }, { status: 400 });
        }

        const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', followingId);

        if (error) {
            console.error('Unfollow error:', error);
            return NextResponse.json({ error: '取消關注失敗', details: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: '已取消關注' });
    } catch (error) {
        console.error('Unfollow API error:', error);
        return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const followingId = searchParams.get('followingId');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ following: false });

        if (followingId) {
            // Check if following specific user
            const { data, error } = await supabase
                .from('follows')
                .select('id')
                .eq('follower_id', user.id)
                .eq('following_id', followingId)
                .single();

            return NextResponse.json({ following: !!data });
        }

        // List all following
        const { data, error } = await supabase
            .from('follows')
            .select(`
                following_id,
                following:following_id (
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .eq('follower_id', user.id);

        if (error) throw error;

        return NextResponse.json({ follows: data });
    } catch (error) {
        console.error('Get follows error:', error);
        return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
    }
}
