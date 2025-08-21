
-- إنشاء جدول إغلاق الورديات
CREATE TABLE public.shift_closures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_type TEXT NOT NULL CHECK (shift_type IN ('morning', 'evening')),
  shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
  coins_small NUMERIC NOT NULL DEFAULT 0,
  coins_one_dinar NUMERIC NOT NULL DEFAULT 0,
  bills_large NUMERIC NOT NULL DEFAULT 0,
  screen_sales NUMERIC NOT NULL DEFAULT 0,
  cash_sales NUMERIC NOT NULL DEFAULT 0,
  card_sales NUMERIC NOT NULL DEFAULT 0,
  tadawul_sales NUMERIC NOT NULL DEFAULT 0,
  presto_sales NUMERIC NOT NULL DEFAULT 0,
  shift_expenses NUMERIC NOT NULL DEFAULT 0,
  prev_coins_small NUMERIC NOT NULL DEFAULT 0,
  prev_coins_one_dinar NUMERIC NOT NULL DEFAULT 0,
  prev_bills_large NUMERIC NOT NULL DEFAULT 0,
  total_actual NUMERIC NOT NULL DEFAULT 0,
  total_calculated NUMERIC NOT NULL DEFAULT 0,
  difference NUMERIC NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل Row Level Security
ALTER TABLE public.shift_closures ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان
CREATE POLICY "Users can view shift closures" 
  ON public.shift_closures 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert shift closures" 
  ON public.shift_closures 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update shift closures" 
  ON public.shift_closures 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete shift closures" 
  ON public.shift_closures 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_shift_closures_updated_at
    BEFORE UPDATE ON public.shift_closures
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
