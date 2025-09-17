-- Create Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Icon name for UI
  color TEXT, -- Color code for UI
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_categories_updated_at();

-- Insert default categories
INSERT INTO categories (name, display_name, description, icon, color, sort_order) VALUES
('hotDrinks', 'مشروبات ساخنة', 'جميع المشروبات الساخنة', 'Coffee', '#8B4513', 1),
('coldDrinks', 'مشروبات باردة', 'المشروبات الباردة والمرطبة', 'Snowflake', '#87CEEB', 2),
('cocktails', 'كوكتيلات', 'كوكتيلات الفواكه الطبيعية', 'Wine', '#FF69B4', 3),
('naturalJuices', 'عصائر طبيعية', 'عصائر الفواكه الطبيعية', 'Apple', '#32CD32', 4),
('Froppy', 'فروبي', 'مشروبات الفروبي المنعشة', 'Droplets', '#00CED1', 5),
('shakes', 'ميلك شيك', 'مشروبات الميلك شيك اللذيذة', 'Milk', '#FFB6C1', 6),
('Smoothie', 'سموذي', 'مشروبات السموذي الصحية', 'Zap', '#98FB98', 7),
('crepes', 'كريب', 'حلويات الكريب المتنوعة', 'Circle', '#DDA0DD', 8),
('croissants', 'كرواسون', 'معجنات الكرواسون الطازجة', 'Croissant', '#F0E68C', 9),
('miniPancakes', 'ميني بان كيك', 'حلويات البان كيك الصغيرة', 'CircleDot', '#FFA07A', 10),
('waffles', 'وافل', 'حلويات الوافل المقرمشة', 'Square', '#DEB887', 11),
('kunafa', 'كنافة', 'حلويات الكنافة التقليدية', 'Star', '#FFD700', 12),
('cakes', 'كيكات', 'تشكيلة متنوعة من الكيكات', 'Cake', '#FF6347', 13),
('sweets', 'حلويات وبقلاوة', 'حلويات تقليدية وبقلاوة', 'Heart', '#FF1493', 14),
('Mohjito', 'موهيتو', 'مشروبات الموهيتو المنعشة', 'Sparkles', '#00FF7F', 15),
('iceCream', 'آيس كريم', 'مشروبات الآيس كريم', 'IceCream', '#B0E0E6', 16),
('breakfast', 'إفطار', 'وجبات الإفطار الشاملة', 'Sunrise', '#FF8C00', 17),
('shakshuka', 'شكشوكة تركية', 'وجبات الشكشوكة التركية', 'Egg', '#FF4500', 18),
('toast', 'توست', 'وجبات التوست المتنوعة', 'Bread', '#D2691E', 19),
('sandwiches', 'سندويشات', 'سندويشات متنوعة', 'Sandwich', '#8B4513', 20),
('pizza', 'بيتزا', 'بيتزا متنوعة', 'Pizza', '#FF0000', 21),
('pastries', 'معجنات', 'معجنات متنوعة', 'Cookie', '#CD853F', 22);

-- Update menu_items to reference categories table
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Update existing menu_items with category_id
UPDATE menu_items 
SET category_id = (
  SELECT id FROM categories 
  WHERE categories.name = menu_items.category
);

-- Add foreign key constraint
ALTER TABLE menu_items 
ADD CONSTRAINT fk_menu_items_category 
FOREIGN KEY (category_id) REFERENCES categories(id);
