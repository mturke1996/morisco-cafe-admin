
-- Create customer_debts table for tracking customer debts
CREATE TABLE public.customer_debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  debt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial')),
  paid_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table for tracking daily sales
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_id UUID REFERENCES public.customers(id),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'tadawul', 'debt')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_cash_count table for end-of-day calculations
CREATE TABLE public.daily_cash_count (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  count_date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  -- Cash breakdown
  coins_small NUMERIC DEFAULT 0, -- نحاس (الفكة)
  coins_one_dinar NUMERIC DEFAULT 0, -- رقاق (عملة 1 دينار)
  bills_large NUMERIC DEFAULT 0, -- غلاض (عملة 5-10-20)
  -- Sales data
  screen_sales_count INTEGER DEFAULT 0, -- عدد المبيعات من الشاشة
  cash_sales NUMERIC DEFAULT 0, -- الكاش
  card_sales NUMERIC DEFAULT 0, -- بطاقة المصرفية
  tadawul_sales NUMERIC DEFAULT 0, -- بطاقة تداول
  presto_sales NUMERIC DEFAULT 0, -- بريستو
  -- Expenses
  daily_expenses NUMERIC DEFAULT 0, -- المصروفات اليومية
  -- Previous day balances
  prev_coins_small NUMERIC DEFAULT 0,
  prev_coins_one_dinar NUMERIC DEFAULT 0,
  prev_bills_large NUMERIC DEFAULT 0,
  -- Calculations
  total_calculated NUMERIC DEFAULT 0,
  total_actual NUMERIC DEFAULT 0,
  difference NUMERIC DEFAULT 0, -- الفرق (فائض أو نقص)
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE public.customer_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_cash_count ENABLE ROW LEVEL SECURITY;

-- RLS policies for customer_debts
CREATE POLICY "Users can view customer debts" ON public.customer_debts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert customer debts" ON public.customer_debts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update customer debts" ON public.customer_debts FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete customer debts" ON public.customer_debts FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS policies for sales
CREATE POLICY "Users can view sales" ON public.sales FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert sales" ON public.sales FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update sales" ON public.sales FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete sales" ON public.sales FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS policies for daily_cash_count
CREATE POLICY "Users can view daily cash count" ON public.daily_cash_count FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert daily cash count" ON public.daily_cash_count FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update daily cash count" ON public.daily_cash_count FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete daily cash count" ON public.daily_cash_count FOR DELETE USING (auth.uid() IS NOT NULL);

-- Update triggers for updated_at columns
CREATE TRIGGER update_customer_debts_updated_at
    BEFORE UPDATE ON public.customer_debts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
    BEFORE UPDATE ON public.sales
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_cash_count_updated_at
    BEFORE UPDATE ON public.daily_cash_count
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate customer total debt
CREATE OR REPLACE FUNCTION get_customer_total_debt(customer_uuid UUID)
RETURNS NUMERIC AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(amount - COALESCE(paid_amount, 0)) 
         FROM public.customer_debts 
         WHERE customer_id = customer_uuid AND status != 'paid'), 
        0
    );
END;
$$ LANGUAGE plpgsql;
