import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// 聯絡表單訊息會存入 reports 表（type: feedback）
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { name, email, subject, message } = body;

        // 驗證必要欄位
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: '請填寫所有必填欄位' },
                { status: 400 }
            );
        }

        // 驗證 email 格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: '請輸入有效的電子郵件地址' },
                { status: 400 }
            );
        }

        // 獲取當前用戶（可選）
        const { data: { user } } = await supabase.auth.getUser();

        // 存入 reports 表
        const { data: report, error } = await supabase
            .from('reports')
            .insert({
                report_type: 'feedback',
                category: subject || 'contact',
                content: `[聯絡表單]\n姓名：${name}\nEmail：${email}\n\n${message}`,
                contact_email: email,
                reporter_id: user?.id || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving contact form:', error);
            return NextResponse.json(
                { error: '提交失敗，請稍後再試' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: '感謝您的訊息，我們會盡快回覆！' },
            { status: 201 }
        );

    } catch (error: unknown) {
        console.error('Unexpected error in POST /api/contact:', error);
        return NextResponse.json(
            { error: '伺服器錯誤' },
            { status: 500 }
        );
    }
}
