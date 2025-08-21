-- =====================================================
-- ترحيل كامل لإصلاح مشاكل إغلاق الوردية والمصروفات
-- =====================================================

-- =====================================================
-- الجزء الأول: إنشاء جدول أرشفة المصروفات
-- =====================================================

-- Ensure UUID generation available
create extension if not exists "pgcrypto";

create table if not exists public.shift_closure_expenses (
  id uuid primary key default gen_random_uuid(),
  shift_closure_id uuid not null references public.shift_closures(id) on delete cascade,
  title text not null,
  description text,
  amount numeric not null,
  category text,
  date date not null,
  receipt_url text,
  created_by uuid,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_shift_closure_expenses_closure on public.shift_closure_expenses(shift_closure_id);

-- Basic permissive RLS to allow app access (adjust for production)
alter table public.shift_closure_expenses enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'shift_closure_expenses' and policyname = 'allow_select_all'
  ) then
    create policy allow_select_all on public.shift_closure_expenses for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'shift_closure_expenses' and policyname = 'allow_insert_all'
  ) then
    create policy allow_insert_all on public.shift_closure_expenses for insert with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'shift_closure_expenses' and policyname = 'allow_update_all'
  ) then
    create policy allow_update_all on public.shift_closure_expenses for update using (true) with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'shift_closure_expenses' and policyname = 'allow_delete_all'
  ) then
    create policy allow_delete_all on public.shift_closure_expenses for delete using (true);
  end if;
end $$;

-- =====================================================
-- الجزء الثاني: تنظيف الورديات المكررة وإصلاح تصفير المصروفات
-- =====================================================

-- First, let's identify and remove duplicate shift closures
-- Keep only the most recent one for each date/shift_type combination
WITH duplicate_shifts AS (
  SELECT 
    id,
    shift_date,
    shift_type,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY shift_date, shift_type 
      ORDER BY created_at DESC
    ) as rn
  FROM shift_closures
)
DELETE FROM shift_closures 
WHERE id IN (
  SELECT id 
  FROM duplicate_shifts 
  WHERE rn > 1
);

-- Add a unique constraint to prevent future duplicates
ALTER TABLE shift_closures 
ADD CONSTRAINT unique_shift_date_type 
UNIQUE (shift_date, shift_type);

-- Create a function to properly clear expenses after shift closure
CREATE OR REPLACE FUNCTION clear_expenses_after_shift_closure()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete expenses for the shift date from the main expenses table
  DELETE FROM expenses 
  WHERE date = NEW.shift_date;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically clear expenses when shift is closed
DROP TRIGGER IF EXISTS trigger_clear_expenses_after_shift_closure ON shift_closures;
CREATE TRIGGER trigger_clear_expenses_after_shift_closure
  AFTER INSERT ON shift_closures
  FOR EACH ROW
  EXECUTE FUNCTION clear_expenses_after_shift_closure();

-- Add index for better performance on date-based queries
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_shift_closures_date_type ON shift_closures(shift_date, shift_type);

-- =====================================================
-- رسالة نجاح
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'تم تطبيق الترحيل بنجاح!';
  RAISE NOTICE '✅ تم إنشاء جدول shift_closure_expenses';
  RAISE NOTICE '✅ تم تنظيف الورديات المكررة';
  RAISE NOTICE '✅ تم إضافة قيد فريد لمنع التكرار';
  RAISE NOTICE '✅ تم إنشاء trigger لتصفير المصروفات تلقائياً';
  RAISE NOTICE '✅ تم إضافة فهارس لتحسين الأداء';
END $$;
