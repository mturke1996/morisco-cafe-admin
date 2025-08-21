
-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_reminders table
CREATE TABLE public.payment_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  debt_id UUID REFERENCES public.customer_debts(id),
  message TEXT NOT NULL,
  reminder_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invoices" 
  ON public.invoices 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert invoices" 
  ON public.invoices 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update invoices" 
  ON public.invoices 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete invoices" 
  ON public.invoices 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Add RLS policies for invoice_items
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invoice items" 
  ON public.invoice_items 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert invoice items" 
  ON public.invoice_items 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update invoice items" 
  ON public.invoice_items 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete invoice items" 
  ON public.invoice_items 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Add RLS policies for payment_reminders
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payment reminders" 
  ON public.payment_reminders 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert payment reminders" 
  ON public.payment_reminders 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update payment reminders" 
  ON public.payment_reminders 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete payment reminders" 
  ON public.payment_reminders 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Add trigger for updated_at columns
CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON public.invoices 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_reminders_updated_at 
  BEFORE UPDATE ON public.payment_reminders 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    invoice_number TEXT;
BEGIN
    -- Get the next invoice number
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.invoices
    WHERE invoice_number ~ '^INV[0-9]+$';
    
    -- Format as INV followed by padded number
    invoice_number := 'INV' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;
