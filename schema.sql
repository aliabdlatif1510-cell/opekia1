-- Opekia: جدول الشراكات والعقود (Supabase / PostgreSQL)
create extension if not exists pgcrypto;

create table if not exists public.contracts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title       text not null,
  partner     text not null,
  type        text not null check (type in ('strategic', 'service', 'mou')),
  start_date  date not null,
  end_date    date not null check (end_date >= start_date),
  value       numeric(14,2) not null default 0 check (value >= 0),
  progress    smallint not null default 0 check (progress between 0 and 100),
  status      text not null default 'active' check (status in ('active', 'review', 'expiring', 'expired')),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists contracts_user_end_idx on public.contracts (user_id, end_date);

alter table public.contracts enable row level security;

create policy "contracts_select_own" on public.contracts for select using (auth.uid() = user_id);
create policy "contracts_insert_own" on public.contracts for insert with check (auth.uid() = user_id);
create policy "contracts_update_own" on public.contracts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "contracts_delete_own" on public.contracts for delete using (auth.uid() = user_id);
