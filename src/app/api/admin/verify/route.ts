import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Rate limiting: 簡易記憶體存儲（生產環境建議用 Redis）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX = 10; // 每分鐘最大請求數
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 分鐘

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return false;
    }

    record.count++;
    return true;
}

// 安全比較函數（防止時間攻擊）
function secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        // 仍執行比較以保持恆定時間
        crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a));
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(request: Request) {
    try {
        // 獲取客戶端 IP
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

        // Rate limit 檢查
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { success: false, error: '請求過於頻繁，請稍後再試' },
                { status: 429 }
            );
        }

        const { password } = await request.json();

        if (!password || typeof password !== 'string') {
            return NextResponse.json(
                { success: false, error: '密碼不能為空' },
                { status: 400 }
            );
        }

        // 從環境變數獲取管理員密碼
        const adminPassword = process.env.ADMIN_SECRET_PASSWORD;

        if (!adminPassword) {
            console.error('ADMIN_SECRET_PASSWORD environment variable is not set');
            return NextResponse.json(
                { success: false, error: '系統配置錯誤' },
                { status: 500 }
            );
        }

        // 安全比較密碼
        const isValid = secureCompare(password, adminPassword);

        if (!isValid) {
            // 延遲回應以防止暴力破解
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
            return NextResponse.json(
                { success: false, error: '密碼錯誤' },
                { status: 401 }
            );
        }

        // 生成會話 token
        const token = crypto.randomBytes(32).toString('hex');

        return NextResponse.json({
            success: true,
            token,
            message: '認證成功'
        });

    } catch (error) {
        console.error('Admin verification error:', error);
        return NextResponse.json(
            { success: false, error: '認證失敗' },
            { status: 500 }
        );
    }
}
