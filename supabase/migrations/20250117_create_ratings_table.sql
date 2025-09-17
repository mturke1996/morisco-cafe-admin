-- إنشاء جدول التقييمات
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL, -- اسم العميل
  customer_phone TEXT NOT NULL, -- رقم هاتف العميل
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- التقييم من 1 إلى 5
  comment TEXT, -- تعليق العميل
  table_number INTEGER, -- رقم الطاولة
  order_id TEXT, -- معرف الطلب (اختياري)
  is_approved BOOLEAN DEFAULT false, -- موافقة على النشر
  is_flagged BOOLEAN DEFAULT false, -- تم وضع علامة على المحتوى المسيء
  flagged_reason TEXT, -- سبب وضع العلامة
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_ratings_approved ON ratings(is_approved);
CREATE INDEX IF NOT EXISTS idx_ratings_rating ON ratings(rating);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at);
CREATE INDEX IF NOT EXISTS idx_ratings_flagged ON ratings(is_flagged);

-- إنشاء دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث updated_at تلقائياً
DROP TRIGGER IF EXISTS update_ratings_updated_at ON ratings;
CREATE TRIGGER update_ratings_updated_at 
    BEFORE UPDATE ON ratings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_ratings_updated_at();

-- إضافة تعليق توضيحي للجدول
COMMENT ON TABLE ratings IS 'جدول تقييمات العملاء للخدمة والطعام';
COMMENT ON COLUMN ratings.customer_name IS 'اسم العميل';
COMMENT ON COLUMN ratings.customer_phone IS 'رقم هاتف العميل';
COMMENT ON COLUMN ratings.rating IS 'التقييم من 1 إلى 5 نجوم';
COMMENT ON COLUMN ratings.comment IS 'تعليق العميل على الخدمة';
COMMENT ON COLUMN ratings.table_number IS 'رقم الطاولة';
COMMENT ON COLUMN ratings.order_id IS 'معرف الطلب المرتبط بالتقييم';
COMMENT ON COLUMN ratings.is_approved IS 'موافقة على نشر التقييم';
COMMENT ON COLUMN ratings.is_flagged IS 'تم وضع علامة على المحتوى المسيء';
COMMENT ON COLUMN ratings.flagged_reason IS 'سبب وضع العلامة على المحتوى';

-- إدراج بيانات تجريبية
INSERT INTO ratings (customer_name, customer_phone, rating, comment, table_number, order_id, is_approved) VALUES
('أحمد محمد', '0912345678', 5, 'الطعام ممتاز والخدمة سريعة', 5, 'ORD-001', true),
('فاطمة علي', '0923456789', 4, 'جيد جداً، أنصح به', 3, 'ORD-002', true),
('محمد حسن', '0934567890', 3, 'مقبول، لكن يمكن تحسين الخدمة', 7, 'ORD-003', true),
('نور الدين', '0945678901', 5, 'أفضل مطعم في المدينة!', 2, 'ORD-004', true),
('سارة أحمد', '0956789012', 2, 'الطعام بارد والخدمة بطيئة', 1, 'ORD-005', false),
('علي محمود', '0967890123', 1, 'أسوأ تجربة في حياتي', 4, 'ORD-006', false),
('مريم سالم', '0978901234', 4, 'القهوة رائعة والجو جميل', 6, 'ORD-007', true),
('خالد عمر', '0989012345', 5, 'شكراً لكم على الخدمة الممتازة', 8, 'ORD-008', true);
