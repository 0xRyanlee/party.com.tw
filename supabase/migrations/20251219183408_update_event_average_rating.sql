-- Migration: Update event average rating
-- Updates attendee_rating_score and review_count on events table

CREATE OR REPLACE FUNCTION update_event_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.event_id IS NOT NULL THEN
            UPDATE events 
            SET 
                review_count = (SELECT count(*) FROM reviews WHERE event_id = NEW.event_id AND status = 'approved'),
                attendee_rating_score = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE event_id = NEW.event_id AND status = 'approved')
            WHERE id = NEW.event_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.event_id IS NOT NULL THEN
            UPDATE events 
            SET 
                review_count = (SELECT count(*) FROM reviews WHERE event_id = OLD.event_id AND status = 'approved'),
                attendee_rating_score = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE event_id = OLD.event_id AND status = 'approved')
            WHERE id = OLD.event_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS trigger_update_event_review_count ON reviews;
DROP TRIGGER IF EXISTS trigger_update_event_review_stats ON reviews;

CREATE TRIGGER trigger_update_event_review_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_event_review_stats();
