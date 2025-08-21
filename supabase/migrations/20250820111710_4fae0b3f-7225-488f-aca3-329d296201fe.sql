
-- Create salary_payments table to store salary payment records
CREATE TABLE public.salary_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  days_worked INTEGER NOT NULL DEFAULT 0,
  daily_wage NUMERIC NOT NULL DEFAULT 0,
  gross_amount NUMERIC NOT NULL DEFAULT 0,
  total_bonuses NUMERIC NOT NULL DEFAULT 0,
  total_deductions NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  remaining_balance NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'partial',
  notes TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view salary payments" ON public.salary_payments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert salary payments" ON public.salary_payments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update salary payments" ON public.salary_payments
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete salary payments" ON public.salary_payments
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create trigger to update updated_at column
CREATE TRIGGER update_salary_payments_updated_at
  BEFORE UPDATE ON public.salary_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
