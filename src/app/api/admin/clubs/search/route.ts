import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit') || '20');

        let dbQuery = supabase
            .from('clubs')
            .select(`
                id,
                name,
                description,
                is_private,
                owner_id,
                member_count,
                created_at
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        // 搜索過濾
        if (query) {
            dbQuery = dbQuery.ilike('name', `%${query}%`);
        }

        const { data: clubs, error } = await dbQuery;

        if (error) {
            console.error('Club search error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            clubs: clubs || [],
            total: clubs?.length || 0,
        });
    } catch (error) {
        console.error('Club search error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
