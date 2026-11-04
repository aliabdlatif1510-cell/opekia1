-- ==============================================================================
-- Opekia SaaS Platform: Database Setup with Role-Based Access Control (RBAC)
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/tkmpqigzqsavspxknqxl/sql
-- ==============================================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------------------
-- 1. Profiles Table (Linked to auth.users with RBAC roles)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  role        text not null default 'client' check (role in ('admin', 'client')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index on email and role for fast lookups
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_email_idx on public.profiles (email);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Drop previous policies if any to avoid conflicts
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_select_policy" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;

-- Users can read their own profile, or admins can read all profiles
create policy "profiles_select_policy"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Users can update their own full_name (role cannot be changed by client)
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. Trigger Function: Automatically create profile with 'client' role on signup
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'client'
  )
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. Backfill profiles for existing users in auth.users
-- ------------------------------------------------------------------------------
insert into public.profiles (id, full_name, email, role)
select
  id,
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  email,
  'client'
from auth.users
on conflict (id) do nothing;

-- ------------------------------------------------------------------------------
-- 4. Contracts Table (Secured with RBAC: Clients see only their own, Admins see all)
-- ------------------------------------------------------------------------------
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

drop policy if exists "contracts_select_own" on public.contracts;
drop policy if exists "contracts_select_policy" on public.contracts;
drop policy if exists "contracts_insert_policy" on public.contracts;
drop policy if exists "contracts_update_policy" on public.contracts;
drop policy if exists "contracts_delete_policy" on public.contracts;

-- Clients can only select contracts belonging to their user_id, Admins can view all contracts
create policy "contracts_select_policy"
  on public.contracts for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Only Admins or the owner can insert
create policy "contracts_insert_policy"
  on public.contracts for insert
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Only Admins or the owner can update
create policy "contracts_update_policy"
  on public.contracts for update
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Only Admins or the owner can delete
create policy "contracts_delete_policy"
  on public.contracts for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 5. SET YOUR ACCOUNT TO ADMIN (Run this after creating your account)
-- Replace 'your_email@example.com' with your actual registered email address:
-- ------------------------------------------------------------------------------
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'your_email@example.com';
