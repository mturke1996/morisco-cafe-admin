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

-- Create function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at (if not exists)
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON menu_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Clear existing data
DELETE FROM menu_items;

-- Insert all menu data
INSERT INTO menu_items (name, category, price, prices, description, options, is_available, sort_order) VALUES

-- ===========================================
-- مشروبات ساخنة
-- ===========================================
('مشروبات ساخنة', 'hotDrinks', 0, NULL, NULL, NULL, true, 0),
('قهوه عربيه سادا', 'hotDrinks', 8, NULL, NULL, '["سادة", "معدلة", "ناقصة"]', true, 1),
('قهوه عربيه معدلة', 'hotDrinks', 8, NULL, NULL, '["سادة", "معدلة", "ناقصة"]', true, 2),
('قهوه عربيه ناقصه', 'hotDrinks', 8, NULL, NULL, '["سادة", "معدلة", "ناقصة"]', true, 3),
('كابتشينو', 'hotDrinks', 6, NULL, NULL, NULL, true, 4),
('كابتشينو دبل', 'hotDrinks', 7, NULL, NULL, NULL, true, 5),
('مكياتو', 'hotDrinks', 5, NULL, NULL, NULL, true, 6),
('كريمه', 'hotDrinks', 5, NULL, NULL, NULL, true, 7),
('نص نص', 'hotDrinks', 5, NULL, NULL, NULL, true, 8),
('نسكافيه عادية', 'hotDrinks', 6, NULL, NULL, '["عادي", "بالماء"]', true, 9),
('نسكافيه عادية بالماء', 'hotDrinks', 6, NULL, NULL, '["عادي", "بالماء"]', true, 10),
('نسكافيه حبوب وحليب', 'hotDrinks', 5, NULL, NULL, '["عادي", "بالماء"]', true, 11),
('نسكافيه حبوب وماء', 'hotDrinks', 5, NULL, NULL, '["عادي", "بالماء"]', true, 12),
('نسكافيه كامل', 'hotDrinks', 8, NULL, NULL, '["عادي", "بالماء"]', true, 13),
('نسكافيه كامل بالماء', 'hotDrinks', 6, NULL, NULL, '["عادي", "بالماء"]', true, 14),
('نسكافيه لوز فقط', 'hotDrinks', 7, NULL, NULL, '["عادي", "بالماء"]', true, 15),
('نسكافيه نوتيلا فقط', 'hotDrinks', 7, NULL, NULL, '["عادي", "بالماء"]', true, 16),
('نسكافيه فل', 'hotDrinks', 10, NULL, NULL, '["عادي", "بالماء"]', true, 17),
('شاي اخضر كيس', 'hotDrinks', 4, NULL, NULL, NULL, true, 18),
('شاي احمر كيس', 'hotDrinks', 4, NULL, NULL, NULL, true, 19),
('شاي اخضر مغربي', 'hotDrinks', 4, NULL, NULL, NULL, true, 20),
('شاي احمر مغربي', 'hotDrinks', 4, NULL, NULL, NULL, true, 21),
('كافي لاتي', 'hotDrinks', 7, NULL, NULL, NULL, true, 22),
('سيبسيال', 'hotDrinks', 6, NULL, NULL, NULL, true, 23),
('هوت شوكلت', 'hotDrinks', 12, NULL, NULL, NULL, true, 24),

-- ===========================================
-- مشروبات باردة
-- ===========================================
('مشروبات باردة', 'coldDrinks', 0, NULL, NULL, NULL, true, 0),
('سبانش لاتيه', 'coldDrinks', 12, NULL, NULL, NULL, true, 1),
('ايس كافيه', 'coldDrinks', 12, NULL, NULL, NULL, true, 2),
('فانيليا لاتيه', 'coldDrinks', 12, NULL, NULL, NULL, true, 3),
('كراميل لاتيه', 'coldDrinks', 12, NULL, NULL, NULL, true, 4),
('بندق لاتيه', 'coldDrinks', 12, NULL, NULL, NULL, true, 5),
('ايس شوكلت', 'coldDrinks', 12, NULL, NULL, NULL, true, 6),
('فرابتشينو', 'coldDrinks', 13, NULL, NULL, NULL, true, 7),

-- ===========================================
-- كوكتيلات
-- ===========================================
('كوكتيلات', 'cocktails', 0, NULL, NULL, NULL, true, 0),
('كوكتيل فواكه موسمية', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 1),
('فراولة - موز - جوافة', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 2),
('فراولة - نعناع', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 3),
('فراولة - بنجر', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 4),
('فراولة - أناناس', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 5),
('فراولة - عنب - رمان', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 6),
('فراولة - كيوي - تفاح', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 7),
('فراولة - كيوي - اناناس', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 8),
('مانجا - موز', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 9),
('مانجا - موز - خوخ', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 10),
('مانجا - كيوي', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 11),
('مانجا - جوافة', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 12),
('مانجا - برتقال', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 13),
('ليمون - مانجا', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 14),
('ليمون - نعناع - زنجبيل', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 15),
('فواكه قطع', 'cocktails', 15, NULL, NULL, '["سكر", "بدون سكر"]', true, 16),

-- ===========================================
-- عصائر طبيعية
-- ===========================================
('عصائر طبيعية', 'naturalJuices', 0, NULL, NULL, NULL, true, 0),
('مانجو', 'naturalJuices', NULL, '{"L": 11, "M": 10}', NULL, '["سكر", "بدون سكر"]', true, 1),
('فراولة', 'naturalJuices', NULL, '{"L": 10, "M": 9}', NULL, '["سكر", "بدون سكر"]', true, 2),
('كيوي', 'naturalJuices', NULL, '{"L": 15, "M": 12}', NULL, '["سكر", "بدون سكر"]', true, 3),
('برتقال', 'naturalJuices', NULL, '{"L": 12, "M": 10}', NULL, '["سكر", "بدون سكر"]', true, 4),
('جوافة', 'naturalJuices', NULL, '{"L": 12, "M": 9}', NULL, '["سكر", "بدون سكر"]', true, 5),
('قلعاوي', 'naturalJuices', NULL, '{"L": 12, "M": 10}', NULL, '["سكر", "بدون سكر"]', true, 6),
('أناناس', 'naturalJuices', NULL, '{"L": 12, "M": 10}', NULL, '["سكر", "بدون سكر"]', true, 7),
('هندي', 'naturalJuices', NULL, '{"L": 11, "M": 10}', NULL, '["سكر", "بدون سكر"]', true, 8),
('ليموناده', 'naturalJuices', NULL, '{"L": 10, "M": 8}', NULL, '["سكر", "بدون سكر"]', true, 9),
('خوخ', 'naturalJuices', NULL, '{"L": 17, "M": 15}', NULL, '["سكر", "بدون سكر"]', true, 10),
('رمان', 'naturalJuices', NULL, '{"L": 12, "M": 10}', NULL, '["سكر", "بدون سكر"]', true, 11),
('عنب', 'naturalJuices', NULL, '{"L": 14, "M": 12}', NULL, '["سكر", "بدون سكر"]', true, 12),
('أفوكادو لوز وعسل', 'naturalJuices', NULL, '{"L": 16, "M": 14}', NULL, '["سكر", "بدون سكر"]', true, 13),

-- ===========================================
-- فروبي
-- ===========================================
('فروبي', 'Froppy', 0, NULL, NULL, NULL, true, 0),
('فراولة', 'Froppy', NULL, '{"L": 12, "M": 10}', NULL, '["سكر", "بدون سكر"]', true, 1),
('فراولة - موز', 'Froppy', NULL, '{"L": 12, "M": 10}', NULL, '["سكر", "بدون سكر"]', true, 2),
('فراولة - مانجا', 'Froppy', NULL, '{"L": 12, "M": 10}', NULL, '["سكر", "بدون سكر"]', true, 3),
('مانجا', 'Froppy', NULL, '{"L": 12, "M": 10}', NULL, '["سكر", "بدون سكر"]', true, 4),
('موز', 'Froppy', NULL, '{"L": 12, "M": 10}', NULL, '["سكر", "بدون سكر"]', true, 5),
('تمر - لوز', 'Froppy', NULL, '{"L": 14, "M": 12}', NULL, '["سكر", "بدون سكر"]', true, 6),

-- ===========================================
-- ميلك شيك
-- ===========================================
('ميلك شيك', 'shakes', 0, NULL, NULL, NULL, true, 0),
('نوتيلا', 'shakes', 15, NULL, NULL, NULL, true, 1),
('لوز', 'shakes', 15, NULL, NULL, NULL, true, 2),
('فستق', 'shakes', 17, NULL, NULL, NULL, true, 3),
('لوتس', 'shakes', 15, NULL, NULL, NULL, true, 4),
('أوريو', 'shakes', 15, NULL, NULL, NULL, true, 5),
('بندق', 'shakes', 17, NULL, NULL, NULL, true, 6),
('نوتيلا فستق', 'shakes', 17, NULL, NULL, NULL, true, 7),
('نوتيلا بندق', 'shakes', 17, NULL, NULL, NULL, true, 8),
('بقلاوة', 'shakes', 17, NULL, NULL, NULL, true, 9),

-- ===========================================
-- سموذي
-- ===========================================
('سموذي', 'Smoothie', 0, NULL, NULL, NULL, true, 0),
('فراوله', 'Smoothie', 17, NULL, NULL, NULL, true, 1),
('مانجو', 'Smoothie', 17, NULL, NULL, NULL, true, 2),
('توت بري', 'Smoothie', 17, NULL, NULL, NULL, true, 3),
('فواكه استوائية', 'Smoothie', 17, NULL, NULL, NULL, true, 4),
('كرز', 'Smoothie', 17, NULL, NULL, NULL, true, 5),
('اناناس', 'Smoothie', 17, NULL, NULL, NULL, true, 6),
('فواكع برية', 'Smoothie', 17, NULL, NULL, NULL, true, 7),

-- ===========================================
-- كريب
-- ===========================================
('كريب', 'crepes', 0, NULL, NULL, NULL, true, 0),
('نوتيلا', 'crepes', 15, NULL, NULL, NULL, true, 1),
('نوتيلا لوز', 'crepes', 16, NULL, NULL, NULL, true, 2),
('نوتيلا لوتس', 'crepes', 17, NULL, NULL, NULL, true, 3),
('نوتيلا فستق', 'crepes', 18, NULL, NULL, NULL, true, 4),
('نوتيلا بندق', 'crepes', 18, NULL, NULL, NULL, true, 5),
('كريب براونيز', 'crepes', 20, NULL, NULL, NULL, true, 6),
('كريب كنافة', 'crepes', 17, NULL, NULL, NULL, true, 7),
('كريب موريسكو', 'crepes', 20, NULL, NULL, NULL, true, 8),
('كريب حار', 'crepes', 22, NULL, NULL, NULL, true, 9),
('كريب رد فيلفت', 'crepes', 18, NULL, NULL, NULL, true, 10),
('كريب سوشي', 'crepes', 22, NULL, NULL, NULL, true, 11),
('كريب دبي', 'crepes', 20, NULL, 'نوتيلا - فستق - كنافة', NULL, true, 12),

-- ===========================================
-- كرواسون
-- ===========================================
('كرواسون', 'croissants', 0, NULL, NULL, NULL, true, 0),
('سادة', 'croissants', 7, NULL, NULL, NULL, true, 1),
('نوتيلا', 'croissants', 9, NULL, NULL, NULL, true, 2),
('نوتيلا لوز', 'croissants', 10, NULL, NULL, NULL, true, 3),
('عسل', 'croissants', 9, NULL, NULL, NULL, true, 4),
('عسل لوز', 'croissants', 10, NULL, NULL, NULL, true, 5),
('فستق', 'croissants', 10, NULL, NULL, NULL, true, 6),
('بندق', 'croissants', 10, NULL, NULL, NULL, true, 7),
('كامل', 'croissants', 12, NULL, NULL, NULL, true, 8),
('نوتيلا - فستق', 'croissants', 12, NULL, NULL, NULL, true, 9),
('نوتيلا - بندق', 'croissants', 12, NULL, NULL, NULL, true, 10),
('جبنه عسل', 'croissants', 10, NULL, NULL, NULL, true, 11),
('جبنه عسل زعتر', 'croissants', 10, NULL, NULL, NULL, true, 12),
('جبنه زيت زعتر', 'croissants', 10, NULL, NULL, NULL, true, 13),
('حار', 'croissants', 12, NULL, NULL, NULL, true, 14),

-- ===========================================
-- ميني بان كيك
-- ===========================================
('ميني بان كيك', 'miniPancakes', 0, NULL, NULL, NULL, true, 0),
('نوتيلا', 'miniPancakes', 12, NULL, NULL, NULL, true, 1),
('نوتيلا لوز', 'miniPancakes', 15, NULL, NULL, NULL, true, 2),
('نوتيلا لوتس', 'miniPancakes', 15, NULL, NULL, NULL, true, 3),
('نوتيلا فستق', 'miniPancakes', 15, NULL, NULL, NULL, true, 4),
('نوتيلا بندق', 'miniPancakes', 15, NULL, NULL, NULL, true, 5),

-- ===========================================
-- وافل
-- ===========================================
('وافل', 'waffles', 0, NULL, NULL, NULL, true, 0),
('نوتيلا', 'waffles', 15, NULL, NULL, NULL, true, 1),
('نوتيلا فستق', 'waffles', 15, NULL, NULL, NULL, true, 2),
('نوتيلا بندق', 'waffles', 15, NULL, NULL, NULL, true, 3),
('تـــــام', 'waffles', 20, NULL, NULL, NULL, true, 4),

-- ===========================================
-- كنافة
-- ===========================================
('كنافة', 'kunafa', 0, NULL, NULL, NULL, true, 0),
('قشطة', 'kunafa', 16, NULL, NULL, NULL, true, 1),
('قشطة ونوتيلا', 'kunafa', 17, NULL, NULL, NULL, true, 2),
('قشطة وفستق', 'kunafa', 18, NULL, NULL, NULL, true, 3),
('قشطة ولوتس', 'kunafa', 17, NULL, NULL, NULL, true, 4),
('إضافة آيس كريم', 'kunafa', 3, NULL, NULL, NULL, true, 5),

-- ===========================================
-- كيكات
-- ===========================================
('كيكات', 'cakes', 0, NULL, NULL, NULL, true, 0),
('ردفلفيث', 'cakes', 15, NULL, NULL, NULL, true, 1),
('تشيز كيك لوتس', 'cakes', 15, NULL, NULL, NULL, true, 2),
('نوتيلا', 'cakes', 15, NULL, NULL, NULL, true, 3),
('نوتيلا-فستق', 'cakes', 15, NULL, NULL, NULL, true, 4),
('فراولة', 'cakes', 15, NULL, NULL, NULL, true, 5),
('روسية', 'cakes', 15, NULL, NULL, NULL, true, 6),
('سان سبستيان نوتيلا', 'cakes', 25, NULL, NULL, NULL, true, 7),
('سان سبستيان فستق', 'cakes', 25, NULL, NULL, NULL, true, 8),
('سان سبستيان ساده', 'cakes', 21, NULL, NULL, NULL, true, 9),
('براونيز', 'cakes', 18, NULL, NULL, NULL, true, 10),
('وايت فريش 4 طبقات', 'cakes', 22, NULL, NULL, NULL, true, 11),
('بينك فريش 4 طبقات', 'cakes', 22, NULL, NULL, NULL, true, 12),
('بانوفي', 'cakes', 15, NULL, NULL, NULL, true, 13),
('ترليشيا', 'cakes', 15, NULL, NULL, NULL, true, 14),
('كيك روسية بالخزايني والعوينة', 'cakes', 22, NULL, NULL, NULL, true, 15),
('كيك روسية بالبيكان', 'cakes', 22, NULL, NULL, NULL, true, 16),
('بستاشيو ونوتيلا كيك', 'cakes', 22, NULL, NULL, NULL, true, 17),
('كيك روسية بالبرتقال', 'cakes', 22, NULL, NULL, NULL, true, 18),
('كوكيز كيك', 'cakes', 15, NULL, NULL, NULL, true, 19),
('تراميسو', 'cakes', 15, NULL, NULL, NULL, true, 20),
('كرانشوكو كيك', 'cakes', 16, NULL, NULL, NULL, true, 21),
('كيك لاتي', 'cakes', 16, NULL, NULL, NULL, true, 22),
('كيك كراميل', 'cakes', 8, NULL, NULL, NULL, true, 23),
('بسبوسة قشطة', 'cakes', 7, NULL, NULL, NULL, true, 24),
('بسبوسة تشيز', 'cakes', 5, NULL, NULL, NULL, true, 25),
('بسبوسة نوتيلا', 'cakes', 5, NULL, NULL, NULL, true, 26),

-- ===========================================
-- حلويات وبقلاوة
-- ===========================================
('حلويات وبقلاوة', 'sweets', 0, NULL, NULL, NULL, true, 0),
('بقلاوه طرابلسية', 'sweets', 5, NULL, NULL, NULL, true, 1),
('زماله معسلة', 'sweets', 6, NULL, NULL, NULL, true, 2),
('حجيبات بحشوة الفستق', 'sweets', 6, NULL, NULL, NULL, true, 3),
('اصابع معسلة', 'sweets', 4, NULL, NULL, NULL, true, 4),
('بيكان رول', 'sweets', 10, NULL, NULL, NULL, true, 5),
('بيكان رول', 'sweets', 11, NULL, NULL, NULL, true, 6),
('مافن شكلاته', 'sweets', 8, NULL, NULL, NULL, true, 7),
('انجليش كيك لوز', 'sweets', 7, NULL, NULL, NULL, true, 8),

-- ===========================================
-- موهيتو
-- ===========================================
('موهيتو', 'Mohjito', 0, NULL, NULL, NULL, true, 0),
('كلاسيك', 'Mohjito', 10, NULL, NULL, NULL, true, 1),
('شوكولاتة', 'Mohjito', 10, NULL, NULL, NULL, true, 2),
('خوخ', 'Mohjito', 10, NULL, NULL, NULL, true, 3),
('رمان', 'Mohjito', 10, NULL, NULL, NULL, true, 4),
('برتقال', 'Mohjito', 10, NULL, NULL, NULL, true, 5),
('فراولة', 'Mohjito', 10, NULL, NULL, NULL, true, 6),
('باشن فروت', 'Mohjito', 10, NULL, NULL, NULL, true, 7),
('توت', 'Mohjito', 10, NULL, NULL, NULL, true, 8),
('توت بري', 'Mohjito', 10, NULL, NULL, NULL, true, 9),
('دلاج', 'Mohjito', 10, NULL, NULL, NULL, true, 10),
('علكة', 'Mohjito', 10, NULL, NULL, NULL, true, 11),
('ميكس', 'Mohjito', 10, NULL, NULL, NULL, true, 12),

-- ===========================================
-- آيس كريم
-- ===========================================
('آيس كريم', 'iceCream', 0, NULL, NULL, NULL, true, 0),
('آيس كريم فانيليا', 'iceCream', 7, NULL, NULL, NULL, true, 1),
('آيس كريم مانجو', 'iceCream', 7, NULL, NULL, NULL, true, 2),

-- ===========================================
-- إفطار
-- ===========================================
('إفطار', 'breakfast', 0, NULL, NULL, NULL, true, 0),
('إفطار موربسكو (شخصين)', 'breakfast', 70, NULL, 'شكشوكة تركية - فواكه - لوز- نوعان جبنة - فول - عسل بيض مطبوخ - زيتون - هريسة - مربى - حلوى شامية - سفنزه - 2 فطيرة - خبز بربوش سادة - خبز - إثنان شاي', NULL, true, 1),
('إفطار موربسكو (شخص)', 'breakfast', 40, NULL, 'شكشوكة تركية - نوعان جبنة - بيض مطبوخ - زيتون - هريسة - مربى - خبز - بربوش سادة - 1 شاي', NULL, true, 2),

-- ===========================================
-- شكشوكة تركية
-- ===========================================
('شكشوكة تركية', 'shakshuka', 0, NULL, NULL, NULL, true, 0),
('شكشوكة تركية', 'shakshuka', 18, NULL, 'شكشوكة تركية - هريسة - زيتون - خبز أو توست', NULL, true, 1),
('اومليت مرتديلا', 'shakshuka', 15, NULL, 'مرتيديلا - جبنه موزريلا - خبزه او توست', NULL, true, 2),
('اومليت خضار', 'shakshuka', 15, NULL, 'خضار - جبنه موزريلا - خبزه او توست', NULL, true, 3),
('اومليت كلاسيك', 'shakshuka', 15, NULL, 'جبنه موزريلا - خبزه او توست', NULL, true, 4),

-- ===========================================
-- توست
-- ===========================================
('توست', 'toast', 0, NULL, NULL, NULL, true, 0),
('توب توست', 'toast', 12, NULL, 'جبنة موزاريلا - جبنة شيدر - جبنة بوك - جبنة شرائح - تن', NULL, true, 1),
('توب توست  هريسة', 'toast', 12, NULL, 'جبنة موزاريلا - جبنة شيدر - جبنة بوك - جبنة شرائح - تن + هريسه', NULL, true, 2),
('توست أجبان', 'toast', 10, NULL, 'جبنة موزاريلا - جبنة شيدر - جبنة بوك - جبنة شرائح', NULL, true, 3),
('توست أجبان هريسه', 'toast', 10, NULL, 'جبنة موزاريلا - جبنة شيدر - جبنة بوك - جبنة شرائح + هريسه', NULL, true, 4),
('توست تن', 'toast', 8, NULL, NULL, NULL, true, 5),
(' توست تن هريسه', 'toast', 8, NULL, 'توست تن + هريسه', NULL, true, 6),
('توست VIP', 'toast', 15, NULL, NULL, NULL, true, 7),

-- ===========================================
-- سندويشات
-- ===========================================
('سندويشات', 'sandwiches', 0, NULL, NULL, NULL, true, 0),
('سندويش تن وجبنة', 'sandwiches', 12, NULL, NULL, NULL, true, 1),
('سندويش جبنة', 'sandwiches', 10, NULL, NULL, NULL, true, 2),
('سندويش شكشوكة', 'sandwiches', 14, NULL, NULL, NULL, true, 3),
('سندوتش تن وجبنه وهريسة', 'sandwiches', 12, NULL, NULL, NULL, true, 4),
('سندويش جبنة وهريسة', 'sandwiches', 10, NULL, NULL, NULL, true, 5),
('سندويش صحي (خبز شوفان + ريكوتا + زيت زيتون)', 'sandwiches', 15, NULL, NULL, NULL, true, 6),

-- ===========================================
-- بيتزا
-- ===========================================
('بيتزا', 'pizza', 0, NULL, NULL, NULL, true, 0),
('بيتزا مارغريتا', 'pizza', 18, NULL, NULL, NULL, true, 1),
('بيتزا تونا', 'pizza', 20, NULL, NULL, NULL, true, 2),
('بيتزا تونا ريو', 'pizza', 27, NULL, NULL, NULL, true, 3),
('بيتزا خضروات', 'pizza', 19, NULL, NULL, NULL, true, 4),
('بيتزا خضروات مشوية', 'pizza', 21, NULL, NULL, NULL, true, 5),
('بيتزا ريجينا', 'pizza', 19, NULL, NULL, NULL, true, 6),
('بيتزا فونجي', 'pizza', 20, NULL, NULL, NULL, true, 7),
('بيتزا تشيكن', 'pizza', 20, NULL, NULL, NULL, true, 8),
('بيتزا كباب', 'pizza', 22, NULL, NULL, NULL, true, 9),

-- ===========================================
-- معجنات
-- ===========================================
('معجنات', 'pastries', 0, NULL, NULL, NULL, true, 0),
('كالزوني', 'pastries', 20, NULL, NULL, NULL, true, 1),
('صفيحة جبنة', 'pastries', 15, NULL, NULL, NULL, true, 2);
