-- Fix rating_replies policies and triggers
-- This migration handles the case where policies already exist

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view rating replies" ON rating_replies;
DROP POLICY IF EXISTS "Only authenticated users can insert rating replies" ON rating_replies;
DROP POLICY IF EXISTS "Only authenticated users can update rating replies" ON rating_replies;
DROP POLICY IF EXISTS "Only authenticated users can delete rating replies" ON rating_replies;

-- Create policies
CREATE POLICY "Anyone can view rating replies" ON rating_replies
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert rating replies" ON rating_replies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update rating replies" ON rating_replies
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete rating replies" ON rating_replies
  FOR DELETE USING (auth.role() = 'authenticated');

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_rating_replies_updated_at ON rating_replies;

-- Create trigger
CREATE TRIGGER update_rating_replies_updated_at
    BEFORE UPDATE ON rating_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
