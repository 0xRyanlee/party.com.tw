import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin Client (for server-side operations)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface VercelDeploymentPayload {
    type: string;
    payload: {
        deployment: {
            id: string;
            name: string;
            url: string;
            meta?: {
                githubCommitSha?: string;
                githubCommitMessage?: string;
                githubCommitAuthorName?: string;
            };
        };
        project: {
            id: string;
            name: string;
        };
    };
    createdAt: number;
}

export async function POST(request: Request) {
    try {
        const body: VercelDeploymentPayload = await request.json();

        // 驗證 Webhook 簽名（可選，增加安全性）
        const authHeader = request.headers.get('authorization');
        const expectedToken = process.env.VERCEL_WEBHOOK_SECRET;

        if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 只處理部署完成事件
        if (body.type !== 'deployment.created' && body.type !== 'deployment.succeeded') {
            return NextResponse.json({ message: 'Event ignored' });
        }

        const deployment = body.payload.deployment;
        const project = body.payload.project;

        // 記錄到日誌表
        const logEntry = {
            type: 'deployment',
            level: 'info',
            message: `Vercel 部署完成: ${project.name}`,
            metadata: {
                deployment_id: deployment.id,
                url: deployment.url,
                commit_sha: deployment.meta?.githubCommitSha,
                commit_message: deployment.meta?.githubCommitMessage,
                author: deployment.meta?.githubCommitAuthorName,
            },
            created_at: new Date(body.createdAt).toISOString(),
        };

        // 嘗試插入到 system_logs 表（如果存在）
        const { error } = await supabaseAdmin
            .from('system_logs')
            .insert(logEntry);

        if (error) {
            console.error('Failed to log deployment:', error);
            // 不阻止響應
        }

        // 如果有 commit message，自動創建版本更新記錄
        if (deployment.meta?.githubCommitMessage) {
            const message = deployment.meta.githubCommitMessage;

            // 解析 commit message 格式：{type}: {title}
            const typeMatch = message.match(/^(feat|fix|chore|refactor|docs|style|test)(\(.+\))?:/i);
            const updateType = typeMatch
                ? (typeMatch[1].toLowerCase() === 'feat' ? 'feature' :
                    typeMatch[1].toLowerCase() === 'fix' ? 'fix' : 'improvement')
                : 'improvement';

            // 可選：自動創建版本更新草稿
            // await supabaseAdmin.from('version_updates').insert({
            //     title: message.slice(0, 100),
            //     description: message,
            //     type: updateType,
            //     is_published: false,
            // });
        }

        return NextResponse.json({
            success: true,
            message: 'Deployment logged successfully',
            deployment_id: deployment.id,
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// 健康檢查
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: 'vercel-webhook',
        description: 'Receives Vercel deployment notifications',
    });
}
