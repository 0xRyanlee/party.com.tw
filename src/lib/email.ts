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

// ==================== 管理通知模板 ====================

export type AdminEmailTemplate =
    | 'tier_expiring'
    | 'promotion'
    | 'system_announcement'
    | 'welcome_new_user';

// 管理通知模板生成
export function generateAdminEmailTemplate(
    template: AdminEmailTemplate,
    data: Record<string, string>
): { subject: string; html: string } {
    const baseStyle = `
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
    `;

    const headerStyle = `
        background: #18181b;
        color: #ffffff;
        padding: 32px 24px;
        text-align: center;
    `;

    const contentStyle = `
        padding: 32px 24px;
    `;

    const buttonStyle = `
        display: inline-block;
        background: #18181b;
        color: #ffffff;
        padding: 14px 28px;
        border-radius: 9999px;
        text-decoration: none;
        font-weight: 600;
        margin-top: 24px;
    `;

    const footerStyle = `
        padding: 24px;
        text-align: center;
        color: #71717a;
        font-size: 12px;
        border-top: 1px solid #e4e4e7;
    `;

    const templates: Record<AdminEmailTemplate, { subject: string; html: string }> = {
        tier_expiring: {
            subject: `您的 ${data.tier} 會員即將到期`,
            html: `
                <div style="${baseStyle}">
                    <div style="${headerStyle}">
                        <h1 style="margin: 0; font-size: 24px;">會員到期提醒</h1>
                    </div>
                    <div style="${contentStyle}">
                        <p style="font-size: 18px; margin-bottom: 8px;">親愛的 ${data.user_name}，</p>
                        <p style="color: #52525b; line-height: 1.6;">
                            您的 <strong>${data.tier}</strong> 會員將於 <strong>${data.expire_date}</strong> 到期。
                        </p>
                        ${data.coupon_code ? `
                            <div style="background: #fafafa; border-radius: 8px; padding: 20px; margin: 24px 0;">
                                <p style="margin: 0 0 8px; font-weight: 600;">專屬優惠碼</p>
                                <p style="margin: 0; font-size: 24px; font-family: monospace; color: #18181b;">${data.coupon_code}</p>
                                <p style="margin: 8px 0 0; color: #71717a; font-size: 14px;">使用此優惠碼可享續訂折扣</p>
                            </div>
                        ` : ''}
                        ${data.link ? `
                            <a href="${data.link}" style="${buttonStyle}">立即續訂</a>
                        ` : ''}
                    </div>
                    <div style="${footerStyle}">
                        <p style="margin: 0;">Party - 城市活動行事曆</p>
                        <p style="margin: 8px 0 0; font-size: 11px;">此郵件由系統自動發送，請勿直接回覆</p>
                    </div>
                </div>
            `,
        },
        promotion: {
            subject: data.subject || '專屬優惠等你來領取',
            html: `
                <div style="${baseStyle}">
                    <div style="${headerStyle}">
                        <h1 style="margin: 0; font-size: 24px;">專屬優惠</h1>
                    </div>
                    <div style="${contentStyle}">
                        <p style="font-size: 18px; margin-bottom: 8px;">親愛的 ${data.user_name}，</p>
                        <div style="color: #52525b; line-height: 1.8; white-space: pre-wrap;">${data.content || ''}</div>
                        ${data.coupon_code ? `
                            <div style="background: #fafafa; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                                <p style="margin: 0 0 8px; font-weight: 600;">優惠碼</p>
                                <p style="margin: 0; font-size: 28px; font-family: monospace; color: #18181b; letter-spacing: 2px;">${data.coupon_code}</p>
                            </div>
                        ` : ''}
                        ${data.link ? `
                            <div style="text-align: center;">
                                <a href="${data.link}" style="${buttonStyle}">立即領取</a>
                            </div>
                        ` : ''}
                    </div>
                    <div style="${footerStyle}">
                        <p style="margin: 0;">Party - 城市活動行事曆</p>
                    </div>
                </div>
            `,
        },
        system_announcement: {
            subject: data.subject || '系統公告',
            html: `
                <div style="${baseStyle}">
                    <div style="${headerStyle}">
                        <h1 style="margin: 0; font-size: 24px;">系統公告</h1>
                    </div>
                    <div style="${contentStyle}">
                        <p style="font-size: 18px; margin-bottom: 8px;">親愛的 ${data.user_name}，</p>
                        <div style="color: #52525b; line-height: 1.8; white-space: pre-wrap;">${data.content || ''}</div>
                        ${data.link ? `
                            <div style="text-align: center; margin-top: 24px;">
                                <a href="${data.link}" style="${buttonStyle}">了解更多</a>
                            </div>
                        ` : ''}
                    </div>
                    <div style="${footerStyle}">
                        <p style="margin: 0;">Party - 城市活動行事曆</p>
                    </div>
                </div>
            `,
        },
        welcome_new_user: {
            subject: '歡迎加入 Party！',
            html: `
                <div style="${baseStyle}">
                    <div style="${headerStyle}">
                        <h1 style="margin: 0; font-size: 24px;">歡迎加入</h1>
                    </div>
                    <div style="${contentStyle}">
                        <p style="font-size: 18px; margin-bottom: 8px;">親愛的 ${data.user_name}，</p>
                        <p style="color: #52525b; line-height: 1.6;">
                            歡迎加入 Party 平台！我們很高興您成為我們的一員。
                        </p>
                        <p style="color: #52525b; line-height: 1.6;">在這裡，您可以：</p>
                        <ul style="color: #52525b; line-height: 2;">
                            <li>探索城市中各式各樣的活動</li>
                            <li>發起屬於自己的活動</li>
                            <li>認識志同道合的朋友</li>
                        </ul>
                        <div style="text-align: center; margin-top: 24px;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events" style="${buttonStyle}">開始探索</a>
                        </div>
                    </div>
                    <div style="${footerStyle}">
                        <p style="margin: 0;">Party - 城市活動行事曆</p>
                    </div>
                </div>
            `,
        },
    };

    return templates[template];
}

// ==================== 批量發送 ====================

export interface BatchEmailResult {
    total: number;
    sent: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
}

// 批量發送郵件（帶節流）
export async function sendBatchEmails(
    recipients: Array<{ email: string; data: Record<string, string> }>,
    template: AdminEmailTemplate,
    options?: {
        delayMs?: number; // 每封郵件之間的延遲（毫秒）
        batchSize?: number; // 每批發送數量
    }
): Promise<BatchEmailResult> {
    const resend = getResendClient();
    if (!resend) {
        return {
            total: recipients.length,
            sent: 0,
            failed: recipients.length,
            errors: [{ email: 'all', error: 'RESEND_API_KEY not configured' }],
        };
    }

    const delayMs = options?.delayMs || 100; // 默認 100ms 延遲
    const result: BatchEmailResult = {
        total: recipients.length,
        sent: 0,
        failed: 0,
        errors: [],
    };

    for (const recipient of recipients) {
        try {
            const { subject, html } = generateAdminEmailTemplate(template, recipient.data);

            await resend.emails.send({
                from: 'Party <noreply@party.example.com>',
                to: recipient.email,
                subject,
                html,
            });

            result.sent++;

            // 添加延遲避免速率限制
            if (delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        } catch (error) {
            result.failed++;
            result.errors.push({
                email: recipient.email,
                error: String(error),
            });
        }
    }

    return result;
}

// 發送管理通知郵件
export async function sendAdminEmail(
    to: string,
    template: AdminEmailTemplate,
    data: Record<string, string>
): Promise<{ success: boolean; error?: string; id?: string }> {
    const { subject, html } = generateAdminEmailTemplate(template, data);
    return sendEmail({ to, subject, html });
}

