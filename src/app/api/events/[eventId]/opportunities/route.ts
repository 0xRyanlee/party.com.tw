import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/events/[eventId]/opportunities
 * 獲取活動的所有合作機會（roles + resources）
 */
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ eventId: string }> }
) {
    const params = await props.params;
    const supabase = await createClient();
    const { eventId } = params;

    try {
        // 並行獲取角色和資源
        const [rolesResponse, resourcesResponse] = await Promise.all([
            supabase
                .from('event_roles')
                .select('*')
                .eq('event_id', eventId)
                .eq('status', 'open')
                .order('created_at', { ascending: false }),

            supabase
                .from('event_resources')
                .select('*')
                .eq('event_id', eventId)
                .eq('status', 'open')
                .order('created_at', { ascending: false }),
        ]);

        if (rolesResponse.error) throw rolesResponse.error;
        if (resourcesResponse.error) throw resourcesResponse.error;

        return NextResponse.json({
            roles: rolesResponse.data || [],
            resources: resourcesResponse.data || [],
        });
    } catch (error: any) {
        console.error('Error fetching opportunities:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch opportunities' },
            { status: 500 }
        );
    }
}
