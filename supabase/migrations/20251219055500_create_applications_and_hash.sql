-- Create applications table for event role/resource applications
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_role_id UUID REFERENCES public.event_roles(id) ON DELETE SET NULL,
    target_resource_id UUID REFERENCES public.event_resources(id) ON DELETE SET NULL,
    message TEXT,
    contact_info TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate applications for the same role/resource
-- Note: Allowing multiple applications if role/resource are null (general application) 
-- but usually one is specified.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_application ON public.applications (event_id, user_id, COALESCE(target_role_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(target_resource_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Applicants can see their own applications
CREATE POLICY "Users can view their own applications" 
ON public.applications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 2. Event organizers can see applications for their events
CREATE POLICY "Organizers can view applications for their events" 
ON public.applications FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE id = public.applications.event_id 
        AND organizer_id = auth.uid()
    )
);

-- 3. Users can create applications
CREATE POLICY "Users can create applications" 
ON public.applications FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 4. Event organizers can update application status
CREATE POLICY "Organizers can update applications" 
ON public.applications FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE id = public.applications.event_id 
        AND organizer_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE id = public.applications.event_id 
        AND organizer_id = auth.uid()
    )
);

-- 5. Applicants can withdraw (delete) their pending applications
CREATE POLICY "Users can delete their pending applications" 
ON public.applications FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id AND status = 'pending');

-- Add hash column to events for crawler deduplication
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS crawler_hash TEXT UNIQUE;
