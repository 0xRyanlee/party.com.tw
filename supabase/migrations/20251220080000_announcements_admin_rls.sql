-- Migration: Add RLS policies for admin announcement management
-- Created: 2024-12-20

-- Allow admins to INSERT announcements
CREATE POLICY "Admins can create announcements" ON announcements
    FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Allow admins to UPDATE announcements
CREATE POLICY "Admins can update announcements" ON announcements
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Allow admins to DELETE announcements
CREATE POLICY "Admins can delete announcements" ON announcements
    FOR DELETE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Allow admins to SELECT all announcements (not just active)
CREATE POLICY "Admins can read all announcements" ON announcements
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
