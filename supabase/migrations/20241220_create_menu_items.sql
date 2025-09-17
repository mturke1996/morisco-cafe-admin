-- Create MenuItems table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2),
  prices JSONB, -- For items with L/M sizes like {L: 11, M: 10}
  description TEXT,
  options JSONB, -- For items with options like ["سكر", "بدون سكر"]
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON menu_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories
INSERT INTO menu_items (name, category, price, is_available, sort_order) VALUES
('مشروبات ساخنة', 'category_header', 0, true, 1),
('مشروبات باردة', 'category_header', 0, true, 2),
('كوكتيلات', 'category_header', 0, true, 3),
('عصائر طبيعية', 'category_header', 0, true, 4),
('فروبي', 'category_header', 0, true, 5),
('ميلك شيك', 'category_header', 0, true, 6),
('سموذي', 'category_header', 0, true, 7),
('كريب', 'category_header', 0, true, 8),
('كرواسون', 'category_header', 0, true, 9),
('ميني بان كيك', 'category_header', 0, true, 10),
('وافل', 'category_header', 0, true, 11),
('كنافة', 'category_header', 0, true, 12),
('كيكات', 'category_header', 0, true, 13),
('حلويات وبقلاوة', 'category_header', 0, true, 14),
('موهيتو', 'category_header', 0, true, 15),
('آيس كريم', 'category_header', 0, true, 16),
('إفطار', 'category_header', 0, true, 17),
('شكشوكة تركية', 'category_header', 0, true, 18),
('توست', 'category_header', 0, true, 19),
('سندويشات', 'category_header', 0, true, 20),
('بيتزا', 'category_header', 0, true, 21),
('معجنات', 'category_header', 0, true, 22)
ON CONFLICT DO NOTHING;
