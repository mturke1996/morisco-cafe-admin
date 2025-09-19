-- Create rating_replies table
CREATE TABLE IF NOT EXISTS rating_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating_id UUID NOT NULL REFERENCES ratings(id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL,
  replied_by VARCHAR(100) NOT NULL DEFAULT 'موريسكو كافيه',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_rating_replies_rating_id ON rating_replies(rating_id);
CREATE INDEX IF NOT EXISTS idx_rating_replies_created_at ON rating_replies(created_at);

-- Enable RLS
ALTER TABLE rating_replies ENABLE ROW LEVEL SECURITY;

-- Create policies (drop if exists first)
DROP POLICY IF EXISTS "Anyone can view rating replies" ON rating_replies;
DROP POLICY IF EXISTS "Only authenticated users can insert rating replies" ON rating_replies;
DROP POLICY IF EXISTS "Only authenticated users can update rating replies" ON rating_replies;
DROP POLICY IF EXISTS "Only authenticated users can delete rating replies" ON rating_replies;

CREATE POLICY "Anyone can view rating replies" ON rating_replies
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert rating replies" ON rating_replies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update rating replies" ON rating_replies
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete rating replies" ON rating_replies
  FOR DELETE USING (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_rating_replies_updated_at ON rating_replies;
CREATE TRIGGER update_rating_replies_updated_at
    BEFORE UPDATE ON rating_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
