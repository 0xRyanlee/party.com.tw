import { Resend } from 'resend';

/**
 * 郵件工具函數
 * 使用 Resend 發送郵件
 */

// 延遲初始化 - 避免 build 時報錯
function getResendClient() {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not set');
        return null;
    }
    return new Resend(process.env.RESEND_API_KEY);
}

// 郵件類型定義
export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

// 郵件模板類型
export type EmailTemplate =
    | 'registration_confirmation'
    | 'registration_cancelled'
    | 'application_approved'
    | 'application_rejected'
    | 'event_reminder'
    | 'test_email'
    | 'ticket_transfer_received';

// 模板生成函數
export function generateEmailTemplate(
    template: EmailTemplate,
    data: Record<string, string>
): { subject: string; html: string } {
    const templates: Record<EmailTemplate, { subject: string; html: string }> = {
        registration_confirmation: {
            subject: `報名成功：${data.eventTitle}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #000;">報名成功！</h1>
                    <p>您已成功報名「${data.eventTitle}」</p>
                    <p><strong>時間：</strong>${data.eventDate}</p>
                    <p><strong>地點：</strong>${data.eventLocation}</p>
                    <p style="margin-top: 24px;">期待在活動現場見到您！</p>
                    <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
                    <p style="color: #666; font-size: 14px;">Party - 城市活動行事曆</p>
                </div>
            `,
        },
        registration_cancelled: {
            subject: `報名已取消：${data.eventTitle}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #000;">報名已取消</h1>
                    <p>您已取消「${data.eventTitle}」的報名。</p>
                    <p>如有任何問題，請聯繫主辦方。</p>
                </div>
            `,
        },
        application_approved: {
            subject: `申請已通過：${data.eventTitle}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #22c55e;">恭喜！您的申請已通過</h1>
                    <p>您申請加入「${data.eventTitle}」的 ${data.roleName} 已被核准。</p>
                    <p>請按照主辦方指示準備相關事宜。</p>
                </div>
            `,
        },
        application_rejected: {
            subject: `申請結果：${data.eventTitle}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #000;">申請結果通知</h1>
                    <p>很遺憾，您申請「${data.eventTitle}」的 ${data.roleName} 未被選中。</p>
                    <p>感謝您的參與，期待下次合作機會！</p>
                </div>
            `,
        },
        event_reminder: {
            subject: `活動提醒：${data.eventTitle} 即將開始`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #000;">活動即將開始</h1>
                    <p>「${data.eventTitle}」將於 ${data.eventDate} 開始。</p>
                    <p><strong>地點：</strong>${data.eventLocation}</p>
                    <p>請準時出席！</p>
                </div>
            `,
        },
        test_email: {
            subject: `Party 郵件測試`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #000;">🎉 郵件測試成功！</h1>
                    <p>這是一封來自 Party 平台的測試郵件。</p>
                    <p>時間：${data.timestamp}</p>
                    <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
                    <p style="color: #666; font-size: 14px;">Party - 城市活動行事曆</p>
                </div>
            `,
        },
        ticket_transfer_received: {
            subject: `您收到了一張票券：${data.ticketName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #000;">🎟️ 您收到了一張票券</h1>
                    <p><strong>${data.senderName}</strong> 轉讓了一張「${data.ticketName}」票券給您。</p>
                    <p><strong>活動：</strong>${data.eventTitle}</p>
                    <p>請登入 Party 平台查看您的票夾。</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wallet" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: bold; margin-top: 16px;">前往票夾</a>
                    <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
                    <p style="color: #666; font-size: 14px;">Party - 城市活動行事曆</p>
                </div>
            `,
        },
    };

    return templates[template];
}

// 發送郵件函數
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
        const resend = getResendClient();
        if (!resend) {
            return { success: false, error: 'RESEND_API_KEY not configured' };
        }

        const { data, error } = await resend.emails.send({
            from: payload.from || 'Party <onboarding@resend.dev>',
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, id: data?.id };
    } catch (err) {
        console.error('Email send error:', err);
        return { success: false, error: String(err) };
    }
}

// 快捷發送函數
export async function sendTemplateEmail(
    to: string,
    template: EmailTemplate,
    data: Record<string, string>
): Promise<{ success: boolean; error?: string; id?: string }> {
    const { subject, html } = generateEmailTemplate(template, data);
    return sendEmail({ to, subject, html });
}
