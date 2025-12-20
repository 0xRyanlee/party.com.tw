-- Fix Storage policies for banner uploads
-- The 'images' bucket may not have proper policies for admin uploads

-- Create or update the images bucket
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('images', 'images', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Policy: Anyone can view public images
CREATE POLICY "Anyone can view images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'images');

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'images' AND
        auth.role() = 'authenticated'
    );

-- Policy: Users can update their own images (or admins can update any)
CREATE POLICY "Users can update own images" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'images'
    );

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create announcements table if not exists
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'alert')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active announcements
DROP POLICY IF EXISTS "Anyone can read active announcements" ON announcements;
CREATE POLICY "Anyone can read active announcements" ON announcements
    FOR SELECT
    USING (is_active = true);

-- Policy: Only admins can manage announcements (via service role)
-- Note: In production, you'd use a proper admin check

COMMENT ON TABLE announcements IS 'System announcements displayed to all users';
