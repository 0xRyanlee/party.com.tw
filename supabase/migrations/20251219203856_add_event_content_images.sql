-- Add content_images column to events table
-- Supports up to 3 additional content images beyond the main cover image (max 4 total)

-- 1. Add content_images column for storing additional event photos
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS content_images TEXT[] DEFAULT '{}';

-- 2. Add check constraint to limit to 3 content images
ALTER TABLE public.events
ADD CONSTRAINT check_content_images_limit
CHECK (array_length(content_images, 1) IS NULL OR array_length(content_images, 1) <= 3);

-- 3. Create function to validate total images (main + content)
CREATE OR REPLACE FUNCTION public.validate_event_images()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    total_images INTEGER;
BEGIN
    -- Count main image (if exists) + content images
    total_images := 0;
    
    IF NEW.image IS NOT NULL AND NEW.image != '' THEN
        total_images := 1;
    END IF;
    
    IF NEW.content_images IS NOT NULL THEN
        total_images := total_images + array_length(NEW.content_images, 1);
    END IF;
    
    IF total_images > 4 THEN
        RAISE EXCEPTION 'Total images cannot exceed 4 (1 main + 3 content)';
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. Create trigger for image validation
DROP TRIGGER IF EXISTS trigger_validate_event_images ON public.events;
CREATE TRIGGER trigger_validate_event_images
    BEFORE INSERT OR UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_event_images();

-- 5. Add index for better query performance on events with content images
CREATE INDEX IF NOT EXISTS idx_events_has_content_images 
ON public.events ((content_images IS NOT NULL AND array_length(content_images, 1) > 0));

COMMENT ON COLUMN public.events.content_images IS '活動內容圖片（最多3張），加上主圖最多4張';
