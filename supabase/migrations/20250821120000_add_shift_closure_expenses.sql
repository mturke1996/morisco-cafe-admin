-- Create table to archive expenses per shift closure
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

