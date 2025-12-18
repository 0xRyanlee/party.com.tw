import { sendTemplateEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

// 發送測試郵件
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to } = body;

        if (!to) {
            return NextResponse.json({ error: '請提供收件人郵箱' }, { status: 400 });
        }

        const result = await sendTemplateEmail(to, 'test_email', {
            timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: '測試郵件已發送',
                id: result.id
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Test email error:', error);
        return NextResponse.json({ error: '發送失敗' }, { status: 500 });
    }
}
