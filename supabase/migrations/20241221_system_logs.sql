-- System Logs Table for Webhook Events
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'deployment', 'github_push', 'admin_action', 'error'
    level TEXT NOT NULL DEFAULT 'info', -- 'debug', 'info', 'warn', 'error'
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_system_logs_type ON system_logs(type);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);

-- RLS Policy (Admin only read access)
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert (for webhooks)
CREATE POLICY "Service role can insert logs" ON system_logs
    FOR INSERT
    WITH CHECK (true);

-- Allow authenticated admins to read
CREATE POLICY "Admins can read logs" ON system_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Comment
COMMENT ON TABLE system_logs IS 'System event logs from webhooks and admin actions';
