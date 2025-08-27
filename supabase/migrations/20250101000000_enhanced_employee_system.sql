-- Enhanced Employee Management System Migration
-- إضافة مميزات متقدمة لنظام إدارة الموظفين

-- 1. تحديث جدول الموظفين لإضافة نوع العمل
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employment_type TEXT NOT NULL DEFAULT 'shift_based' CHECK (employment_type IN ('shift_based', 'full_time', 'part_time'));
ALTER TABLE employees ADD COLUMN IF NOT EXISTS work_schedule JSONB;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS contract_start_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS contract_end_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS id_number TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS social_security_number TEXT;

-- 2. تحديث جدول employee_profiles لإضافة المميزات الجديدة
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS overtime_rate NUMERIC DEFAULT 0;
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS bonus_rate NUMERIC DEFAULT 0;
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS deduction_rate NUMERIC DEFAULT 0;
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS total_overtime_hours NUMERIC DEFAULT 0;
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS total_bonus_amount NUMERIC DEFAULT 0;
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS total_deduction_amount NUMERIC DEFAULT 0;
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS performance_rating NUMERIC DEFAULT 0;
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS last_evaluation_date DATE;

-- 3. إنشاء جدول ملاحظات الموظفين
CREATE TABLE IF NOT EXISTS employee_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('general', 'performance', 'warning', 'praise', 'incident')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. إنشاء جدول الورديات المتقدمة
CREATE TABLE IF NOT EXISTS employee_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL CHECK (shift_type IN ('morning', 'evening', 'night', 'full_day')),
  start_time TIME,
  end_time TIME,
  break_duration INTEGER DEFAULT 0, -- بالدقائق
  is_overtime BOOLEAN DEFAULT false,
  overtime_hours NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'absent', 'late', 'early_leave')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, shift_date, shift_type)
);

-- 5. إنشاء جدول الإضافي والخصم
CREATE TABLE IF NOT EXISTS employee_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('bonus', 'deduction', 'overtime', 'allowance')),
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_start DATE,
  period_end DATE,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. إنشاء جدول تقارير الموظفين
CREATE TABLE IF NOT EXISTS employee_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL CHECK (report_type IN ('attendance', 'salary', 'performance', 'comprehensive')),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_start DATE,
  period_end DATE,
  report_data JSONB NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. إنشاء جدول إعدادات الموقع
CREATE TABLE IF NOT EXISTS location_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_name TEXT NOT NULL,
  location_address TEXT,
  business_hours JSONB,
  currency TEXT DEFAULT 'KWD',
  tax_rate NUMERIC DEFAULT 0,
  logo_url TEXT,
  contact_info JSONB,
  report_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل Row Level Security لجميع الجداول الجديدة
ALTER TABLE employee_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_settings ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان لجدول ملاحظات الموظفين
CREATE POLICY "Users can view employee notes" ON employee_notes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create employee notes" ON employee_notes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update employee notes" ON employee_notes FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete employee notes" ON employee_notes FOR DELETE USING (auth.uid() IS NOT NULL);

-- إنشاء سياسات الأمان لجدول الورديات
CREATE POLICY "Users can view employee shifts" ON employee_shifts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create employee shifts" ON employee_shifts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update employee shifts" ON employee_shifts FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete employee shifts" ON employee_shifts FOR DELETE USING (auth.uid() IS NOT NULL);

-- إنشاء سياسات الأمان لجدول الإضافي والخصم
CREATE POLICY "Users can view employee adjustments" ON employee_adjustments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create employee adjustments" ON employee_adjustments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update employee adjustments" ON employee_adjustments FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete employee adjustments" ON employee_adjustments FOR DELETE USING (auth.uid() IS NOT NULL);

-- إنشاء سياسات الأمان لجدول التقارير
CREATE POLICY "Users can view employee reports" ON employee_reports FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create employee reports" ON employee_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update employee reports" ON employee_reports FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete employee reports" ON employee_reports FOR DELETE USING (auth.uid() IS NOT NULL);

-- إنشاء سياسات الأمان لجدول إعدادات الموقع
CREATE POLICY "Users can view location settings" ON location_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create location settings" ON location_settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update location settings" ON location_settings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete location settings" ON location_settings FOR DELETE USING (auth.uid() IS NOT NULL);

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_employee_notes_updated_at BEFORE UPDATE ON employee_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_shifts_updated_at BEFORE UPDATE ON employee_shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_adjustments_updated_at BEFORE UPDATE ON employee_adjustments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_location_settings_updated_at BEFORE UPDATE ON location_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إنشاء function لحساب الأجر الإضافي
CREATE OR REPLACE FUNCTION calculate_overtime_pay(
  employee_id_param UUID,
  start_date DATE,
  end_date DATE
) RETURNS NUMERIC AS $$
DECLARE
  total_overtime_hours NUMERIC := 0;
  overtime_rate NUMERIC := 0;
  total_overtime_pay NUMERIC := 0;
BEGIN
  -- حساب ساعات العمل الإضافي
  SELECT COALESCE(SUM(overtime_hours), 0) INTO total_overtime_hours
  FROM employee_shifts
  WHERE employee_id = employee_id_param
    AND shift_date BETWEEN start_date AND end_date
    AND is_overtime = true;
  
  -- جلب معدل الأجر الإضافي
  SELECT COALESCE(overtime_rate, 0) INTO overtime_rate
  FROM employee_profiles
  WHERE employee_id = employee_id_param;
  
  -- حساب إجمالي الأجر الإضافي
  total_overtime_pay := total_overtime_hours * overtime_rate;
  
  RETURN total_overtime_pay;
END;
$$ LANGUAGE plpgsql;

-- إنشاء function لحساب الإضافي والخصم
CREATE OR REPLACE FUNCTION calculate_adjustments(
  employee_id_param UUID,
  start_date DATE,
  end_date DATE
) RETURNS TABLE(bonus_amount NUMERIC, deduction_amount NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN adjustment_type = 'bonus' THEN amount ELSE 0 END), 0) as bonus_amount,
    COALESCE(SUM(CASE WHEN adjustment_type = 'deduction' THEN amount ELSE 0 END), 0) as deduction_amount
  FROM employee_adjustments
  WHERE employee_id = employee_id_param
    AND adjustment_date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- إدراج إعدادات الموقع الافتراضية
INSERT INTO location_settings (location_name, location_address, business_hours, report_settings)
VALUES (
  'مقهى هب',
  'عنوان المقهى',
  '{"monday": {"open": "08:00", "close": "23:00"}, "tuesday": {"open": "08:00", "close": "23:00"}, "wednesday": {"open": "08:00", "close": "23:00"}, "thursday": {"open": "08:00", "close": "23:00"}, "friday": {"open": "08:00", "close": "23:00"}, "saturday": {"open": "08:00", "close": "23:00"}, "sunday": {"open": "08:00", "close": "23:00"}}',
  '{"report_header": "تقرير الموظفين", "include_logo": true, "page_size": "A4", "orientation": "portrait", "footer_text": "تم إنشاء هذا التقرير بواسطة نظام إدارة المقهى"}'
) ON CONFLICT DO NOTHING;
