import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

// 延遲初始化 Resend，避免 build 時報錯
const getResend = () => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
    }
    return new Resend(process.env.RESEND_API_KEY);
};

interface SendNotificationRequest {
    title: string;
    subject: string;
    body: string;
    target_type: 'all' | 'tier' | 'users' | 'clubs';
    target_filter: {
        tier?: string;
        user_ids?: string[];
        club_ids?: string[];
    };
    channel: 'email' | 'site' | 'both';
    variables?: {
        coupon_code?: string;
        link?: string;
    };
}

// 替換模板變量
function replaceVariables(
    template: string,
    user: { display_name: string; email: string; tier?: string; expires_at?: string },
    variables: { coupon_code?: string; link?: string }
): string {
    return template
        .replace(/\{\{user_name\}\}/g, user.display_name || '用戶')
        .replace(/\{\{email\}\}/g, user.email || '')
        .replace(/\{\{tier\}\}/g, user.tier || 'Free')
        .replace(/\{\{expire_date\}\}/g, user.expires_at ? new Date(user.expires_at).toLocaleDateString('zh-TW') : 'N/A')
        .replace(/\{\{coupon_code\}\}/g, variables.coupon_code || '')
        .replace(/\{\{link\}\}/g, variables.link || '');
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body: SendNotificationRequest = await request.json();

        const { title, subject, body: emailBody, target_type, target_filter, channel, variables = {} } = body;

        if (!title || !emailBody) {
            return NextResponse.json({ error: '缺少標題或內容' }, { status: 400 });
        }

        // 獲取目標用戶
        let targetUsers: { id: string; display_name: string; email: string; tier?: string; expires_at?: string }[] = [];

        if (target_type === 'all') {
            const { data } = await supabase
                .from('profiles')
                .select('id, display_name, email')
                .not('email', 'is', null);
            targetUsers = data || [];
        } else if (target_type === 'tier' && target_filter.tier) {
            if (target_filter.tier === 'kol' || target_filter.tier === 'vendor') {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, display_name, email')
                    .eq('role', target_filter.tier)
                    .not('email', 'is', null);
                targetUsers = data || [];
            } else {
                // 查詢 user_tiers 表
                const { data: tierData } = await supabase
                    .from('user_tiers')
                    .select('user_id, tier, expires_at')
                    .eq('tier', target_filter.tier);

                if (tierData && tierData.length > 0) {
                    const userIds = tierData.map(t => t.user_id);
                    const { data: userData } = await supabase
                        .from('profiles')
                        .select('id, display_name, email')
                        .in('id', userIds)
                        .not('email', 'is', null);

                    targetUsers = (userData || []).map(u => {
                        const tierInfo = tierData.find(t => t.user_id === u.id);
                        return {
                            ...u,
                            tier: tierInfo?.tier,
                            expires_at: tierInfo?.expires_at,
                        };
                    });
                }
            }
        } else if (target_type === 'users' && target_filter.user_ids) {
            const { data } = await supabase
                .from('profiles')
                .select('id, display_name, email')
                .in('id', target_filter.user_ids)
                .not('email', 'is', null);
            targetUsers = data || [];
        } else if (target_type === 'clubs' && target_filter.club_ids) {
            // 獲取俱樂部成員
            const { data: memberData } = await supabase
                .from('club_members')
                .select('user_id')
                .in('club_id', target_filter.club_ids);

            if (memberData && memberData.length > 0) {
                const userIds = [...new Set(memberData.map(m => m.user_id))];
                const { data: userData } = await supabase
                    .from('profiles')
                    .select('id, display_name, email')
                    .in('id', userIds)
                    .not('email', 'is', null);
                targetUsers = userData || [];
            }
        }

        if (targetUsers.length === 0) {
            return NextResponse.json({ error: '沒有找到目標用戶' }, { status: 400 });
        }

        const results = {
            sent: 0,
            failed: 0,
            errors: [] as string[],
        };

        // 發送 Email
        if (channel === 'email' || channel === 'both') {
            for (const user of targetUsers) {
                if (!user.email) continue;

                try {
                    const personalizedSubject = replaceVariables(subject, user, variables);
                    const personalizedBody = replaceVariables(emailBody, user, variables);

                    await getResend().emails.send({
                        from: 'Party <noreply@party.example.com>',
                        to: user.email,
                        subject: personalizedSubject,
                        text: personalizedBody,
                    });

                    results.sent++;
                } catch (error) {
                    results.failed++;
                    results.errors.push(`Failed to send to ${user.email}: ${error}`);
                }
            }
        }

        // 發送站內通知
        if (channel === 'site' || channel === 'both') {
            const siteNotifications = targetUsers.map(user => ({
                user_id: user.id,
                type: 'system',
                title: replaceVariables(title, user, variables),
                content: replaceVariables(emailBody, user, variables),
                is_read: false,
                created_at: new Date().toISOString(),
            }));

            const { error: insertError } = await supabase
                .from('notifications')
                .insert(siteNotifications);

            if (insertError) {
                console.error('Failed to insert site notifications:', insertError);
            }
        }

        return NextResponse.json({
            success: true,
            sent: results.sent,
            failed: results.failed,
            total_recipients: targetUsers.length,
        });
    } catch (error) {
        console.error('Send notification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
