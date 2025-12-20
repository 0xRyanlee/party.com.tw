-- Create ticket_transfer_offers table for in-chat ticket transfers
-- This allows users to offer tickets to other event participants via chat

CREATE TABLE IF NOT EXISTS ticket_transfer_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired')),
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying offers by event
CREATE INDEX IF NOT EXISTS idx_ticket_transfer_offers_event ON ticket_transfer_offers(event_id);

-- Index for querying offers by ticket
CREATE INDEX IF NOT EXISTS idx_ticket_transfer_offers_ticket ON ticket_transfer_offers(ticket_id);

-- Index for querying pending offers
CREATE INDEX IF NOT EXISTS idx_ticket_transfer_offers_status ON ticket_transfer_offers(status) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE ticket_transfer_offers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone in the event chat can view pending offers
CREATE POLICY "Participants can view offers for their events" ON ticket_transfer_offers
    FOR SELECT
    USING (
        event_id IN (
            SELECT event_id FROM registrations WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can create offers for their own tickets
CREATE POLICY "Users can create offers for their tickets" ON ticket_transfer_offers
    FOR INSERT
    WITH CHECK (
        from_user_id = auth.uid() AND
        ticket_id IN (
            SELECT id FROM registrations 
            WHERE user_id = auth.uid() 
            AND status = 'confirmed'
        )
    );

-- Policy: Offer creator can update (cancel) their offers
CREATE POLICY "Offer creator can update own offers" ON ticket_transfer_offers
    FOR UPDATE
    USING (from_user_id = auth.uid())
    WITH CHECK (from_user_id = auth.uid());

-- Policy: Anyone can accept a pending offer (with conditions)
CREATE POLICY "Users can accept pending offers" ON ticket_transfer_offers
    FOR UPDATE
    USING (
        status = 'pending' AND
        expires_at > NOW() AND
        from_user_id != auth.uid() AND -- Cannot accept own offer
        event_id IN ( -- Must be participant of the event
            SELECT event_id FROM registrations WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        to_user_id = auth.uid() AND
        status = 'accepted'
    );

-- Function to auto-expire old offers
CREATE OR REPLACE FUNCTION expire_old_transfer_offers()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE ticket_transfer_offers
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$;

-- Add comment
COMMENT ON TABLE ticket_transfer_offers IS 'Stores in-chat ticket transfer offers between event participants';
