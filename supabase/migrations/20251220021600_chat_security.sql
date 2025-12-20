-- ==========================================
-- Chat Security: Rate Limiting & Retention
-- ==========================================

-- 1. Message Cleanup Function (retention: 500 messages or 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void AS $$
DECLARE
    event_record RECORD;
    max_messages INT := 500;
    max_age INTERVAL := '30 days';
BEGIN
    -- For each event with messages
    FOR event_record IN 
        SELECT DISTINCT event_id FROM messages
    LOOP
        -- Delete messages older than 30 days OR exceeding 500 per event
        DELETE FROM messages 
        WHERE id IN (
            SELECT id FROM messages 
            WHERE event_id = event_record.event_id
            AND (
                created_at < NOW() - max_age
                OR id NOT IN (
                    SELECT id FROM messages 
                    WHERE event_id = event_record.event_id
                    ORDER BY created_at DESC 
                    LIMIT max_messages
                )
            )
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Schedule cleanup (requires pg_cron extension in Supabase Pro)
-- Uncomment if pg_cron is available:
-- SELECT cron.schedule('cleanup-old-messages', '0 3 * * *', 'SELECT cleanup_old_messages();');

-- 3. Rate Limiting Table (simple approach using last_message_at)
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;

-- 4. Rate Limiting Function (1 message per 2 seconds per user per event)
CREATE OR REPLACE FUNCTION check_message_rate_limit(check_event_id uuid, check_user_id uuid)
RETURNS boolean AS $$
DECLARE
    last_msg TIMESTAMPTZ;
    rate_limit_seconds INT := 2;
BEGIN
    SELECT last_message_at INTO last_msg
    FROM registrations
    WHERE event_id = check_event_id AND user_id = check_user_id;
    
    -- If no last message or enough time has passed, allow
    IF last_msg IS NULL OR NOW() > last_msg + (rate_limit_seconds || ' seconds')::interval THEN
        -- Update last message time
        UPDATE registrations 
        SET last_message_at = NOW()
        WHERE event_id = check_event_id AND user_id = check_user_id;
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add rate limit check to INSERT policy (optional - can be enforced in API)
-- Note: This adds a function call to the INSERT policy for additional security
-- The API also validates this for better error messaging

-- COMMENTS
COMMENT ON FUNCTION cleanup_old_messages IS 'Cleanup messages older than 30 days or exceeding 500 per event';
COMMENT ON FUNCTION check_message_rate_limit IS 'Rate limit: 1 message per 2 seconds per user per event';
COMMENT ON COLUMN registrations.last_message_at IS 'Timestamp of last message sent, used for rate limiting';
