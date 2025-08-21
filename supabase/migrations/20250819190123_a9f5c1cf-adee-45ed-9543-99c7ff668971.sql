
-- إضافة العلاقة الخارجية بين attendance وemployees
ALTER TABLE attendance 
ADD CONSTRAINT fk_attendance_employee 
FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

-- إنشاء جدول ملفات الموظفين لتتبع اليومية والمسحوبات
CREATE TABLE employee_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  daily_wage NUMERIC DEFAULT 0,
  monthly_withdrawals NUMERIC DEFAULT 0,
  total_work_hours NUMERIC DEFAULT 0,
  last_withdrawal_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- تفعيل RLS للجدول الجديد
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان للجدول الجديد
CREATE POLICY "Users can view employee profiles" 
  ON employee_profiles 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create employee profiles" 
  ON employee_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update employee profiles" 
  ON employee_profiles 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete employee profiles" 
  ON employee_profiles 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- إضافة trigger لتحديث updated_at
CREATE TRIGGER update_employee_profiles_updated_at
  BEFORE UPDATE ON employee_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إنشاء جدول المسحوبات اليومية للموظفين
CREATE TABLE employee_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  withdrawal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS لجدول المسحوبات
ALTER TABLE employee_withdrawals ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول المسحوبات
CREATE POLICY "Users can view employee withdrawals" 
  ON employee_withdrawals 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create employee withdrawals" 
  ON employee_withdrawals 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update employee withdrawals" 
  ON employee_withdrawals 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete employee withdrawals" 
  ON employee_withdrawals 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- إضافة trigger لتحديث updated_at
CREATE TRIGGER update_employee_withdrawals_updated_at
  BEFORE UPDATE ON employee_withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
