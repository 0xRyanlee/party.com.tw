import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GitHubPushPayload {
    ref: string;
    before: string;
    after: string;
    repository: {
        id: number;
        name: string;
        full_name: string;
    };
    pusher: {
        name: string;
        email: string;
    };
    sender: {
        login: string;
        avatar_url: string;
    };
    commits: Array<{
        id: string;
        message: string;
        author: {
            name: string;
            email: string;
        };
        url: string;
        timestamp: string;
    }>;
    head_commit: {
        id: string;
        message: string;
        author: {
            name: string;
            email: string;
        };
        url: string;
        timestamp: string;
    };
}

// 驗證 GitHub Webhook 簽名
function verifySignature(payload: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        const body: GitHubPushPayload = JSON.parse(rawBody);

        // 驗證簽名
        const signature = request.headers.get('x-hub-signature-256');
        const secret = process.env.GITHUB_WEBHOOK_SECRET;

        if (secret && signature) {
            if (!verifySignature(rawBody, signature, secret)) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        // 獲取事件類型
        const eventType = request.headers.get('x-github-event');

        // 只處理 push 事件
        if (eventType !== 'push') {
            return NextResponse.json({ message: `Event '${eventType}' ignored` });
        }

        // 只處理 main/master 分支
        const branch = body.ref.replace('refs/heads/', '');
        if (branch !== 'main' && branch !== 'master') {
            return NextResponse.json({ message: `Branch '${branch}' ignored` });
        }

        const headCommit = body.head_commit;

        // 記錄到日誌表
        const logEntry = {
            type: 'github_push',
            level: 'info',
            message: `GitHub Push: ${headCommit.message.slice(0, 100)}`,
            metadata: {
                repo: body.repository.full_name,
                branch,
                commit_sha: headCommit.id.slice(0, 7),
                commit_url: headCommit.url,
                author: headCommit.author.name,
                pusher: body.pusher.name,
                commits_count: body.commits.length,
            },
            created_at: headCommit.timestamp,
        };

        const { error } = await supabaseAdmin
            .from('system_logs')
            .insert(logEntry);

        if (error) {
            console.error('Failed to log push:', error);
        }

        return NextResponse.json({
            success: true,
            message: 'Push logged successfully',
            commit: headCommit.id.slice(0, 7),
            branch,
        });
    } catch (error) {
        console.error('GitHub webhook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// 健康檢查
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: 'github-webhook',
        description: 'Receives GitHub push notifications',
    });
}
