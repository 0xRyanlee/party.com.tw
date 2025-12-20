-- Add transfer token columns to registrations table for link-based transfer
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS transfer_token TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS transfer_expires_at TIMESTAMPTZ;

-- Index for efficient token lookup
CREATE INDEX IF NOT EXISTS idx_registrations_transfer_token ON registrations(transfer_token) WHERE transfer_token IS NOT NULL;

-- Comment
COMMENT ON COLUMN registrations.transfer_token IS 'One-time token for link-based ticket transfer, expires after claim or timeout';
COMMENT ON COLUMN registrations.transfer_expires_at IS 'Expiration timestamp for the transfer token (typically 24h from generation)';
