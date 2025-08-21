-- =====================================================
-- إصلاح مشكلة تصفير المصروفات
-- =====================================================

-- إزالة الـ trigger المؤقت لتجنب التداخل مع الكود
DROP TRIGGER IF EXISTS trigger_clear_expenses_after_shift_closure ON shift_closures;
DROP FUNCTION IF EXISTS clear_expenses_after_shift_closure();

-- التأكد من وجود الفهارس المطلوبة
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_shift_closures_date_type ON shift_closures(shift_date, shift_type);

-- التأكد من وجود القيد الفريد لمنع الورديات المكررة
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_shift_date_type' 
        AND table_name = 'shift_closures'
    ) THEN
        ALTER TABLE shift_closures 
        ADD CONSTRAINT unique_shift_date_type 
        UNIQUE (shift_date, shift_type);
    END IF;
END $$;

-- رسالة تأكيد
DO $$
BEGIN
  RAISE NOTICE 'تم إصلاح إعدادات تصفير المصروفات!';
  RAISE NOTICE '✅ تم إزالة الـ trigger التلقائي';
  RAISE NOTICE '✅ سيتم التحكم في حذف المصروفات من خلال الكود';
  RAISE NOTICE '✅ تم التأكد من الفهارس والقيود';
END $$;
