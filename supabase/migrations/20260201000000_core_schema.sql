-- Core schema bootstrap for wallet/ledger/lead flows.
-- Uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS to be safe in partial setups.

create extension if not exists "pgcrypto";

-- users table (minimal profile fields used by the app)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  current_plan text default 'free',
  terms_agreed_at timestamp,
  marketing_agreed boolean default false,
  last_left_at timestamp,
  is_super_admin boolean default false,
  created_at timestamp default now()
);

alter table if exists public.users
  add column if not exists email text,
  add column if not exists current_plan text default 'free',
  add column if not exists terms_agreed_at timestamp,
  add column if not exists marketing_agreed boolean default false,
  add column if not exists last_left_at timestamp,
  add column if not exists is_super_admin boolean default false,
  add column if not exists created_at timestamp default now();

-- leads table (public pool; RLS intentionally excluded)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  source_channel text,
  original_url text,
  content_summary text,
  draft_message text,
  ai_intent text,
  ai_urgency_score int,
  status text default 'new',
  created_at timestamp default now()
);

alter table if exists public.leads
  add column if not exists source_channel text,
  add column if not exists original_url text,
  add column if not exists content_summary text,
  add column if not exists draft_message text,
  add column if not exists ai_intent text,
  add column if not exists ai_urgency_score int,
  add column if not exists status text default 'new',
  add column if not exists created_at timestamp default now();

create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_ai_urgency_score_idx on public.leads (ai_urgency_score desc);

-- wallets table
create table if not exists public.wallets (
  user_id uuid primary key references public.users(id) on delete cascade,
  free_credits int default 5,
  subscription_credits int default 0,
  purchased_credits int default 0,
  last_daily_reset timestamp
);

alter table if exists public.wallets
  add column if not exists free_credits int default 5,
  add column if not exists subscription_credits int default 0,
  add column if not exists purchased_credits int default 0,
  add column if not exists last_daily_reset timestamp;

-- transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount int not null,
  type text not null,
  description text,
  related_lead_id uuid references public.leads(id),
  created_at timestamp default now()
);

alter table if exists public.transactions
  add column if not exists user_id uuid,
  add column if not exists amount int,
  add column if not exists type text,
  add column if not exists description text,
  add column if not exists related_lead_id uuid,
  add column if not exists created_at timestamp default now();

create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_user_id_created_at_idx on public.transactions (user_id, created_at);

-- lead_reports table
create table if not exists public.lead_reports (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id),
  user_id uuid not null references public.users(id),
  reason_code text not null,
  reason_detail text,
  created_at timestamp default now()
);

create unique index if not exists lead_reports_unique
  on public.lead_reports (lead_id, user_id);

-- lead_draft_versions table
create table if not exists public.lead_draft_versions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id),
  user_id uuid not null references public.users(id),
  draft_message text not null,
  created_at timestamp default now()
);

create index if not exists lead_draft_versions_lead_id_idx
  on public.lead_draft_versions (lead_id, created_at desc);

-- Enable RLS and add policies for user-owned tables.
-- (leads are intentionally excluded per decision)

-- users table
do $$
begin
  if to_regclass('public.users') is not null then
    execute 'alter table public.users enable row level security';

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'users_select_own'
    ) then
      execute 'create policy users_select_own on public.users for select using (auth.uid() = id)';
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'users_insert_own'
    ) then
      execute 'create policy users_insert_own on public.users for insert with check (auth.uid() = id)';
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'users_update_own'
    ) then
      execute 'create policy users_update_own on public.users for update using (auth.uid() = id)';
    end if;
  end if;
end $$;

-- wallets table
do $$
begin
  if to_regclass('public.wallets') is not null then
    execute 'alter table public.wallets enable row level security';

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'wallets' and policyname = 'wallets_select_own'
    ) then
      execute 'create policy wallets_select_own on public.wallets for select using (auth.uid() = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'wallets' and policyname = 'wallets_insert_own'
    ) then
      execute 'create policy wallets_insert_own on public.wallets for insert with check (auth.uid() = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'wallets' and policyname = 'wallets_update_own'
    ) then
      execute 'create policy wallets_update_own on public.wallets for update using (auth.uid() = user_id)';
    end if;
  end if;
end $$;

-- transactions table
do $$
begin
  if to_regclass('public.transactions') is not null then
    execute 'alter table public.transactions enable row level security';

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'transactions_select_own'
    ) then
      execute 'create policy transactions_select_own on public.transactions for select using (auth.uid() = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'transactions_insert_own'
    ) then
      execute 'create policy transactions_insert_own on public.transactions for insert with check (auth.uid() = user_id)';
    end if;
  end if;
end $$;

-- lead_reports table
do $$
begin
  if to_regclass('public.lead_reports') is not null then
    execute 'alter table public.lead_reports enable row level security';

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_reports' and policyname = 'lead_reports_select_own'
    ) then
      execute 'create policy lead_reports_select_own on public.lead_reports for select using (auth.uid() = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_reports' and policyname = 'lead_reports_insert_own'
    ) then
      execute 'create policy lead_reports_insert_own on public.lead_reports for insert with check (auth.uid() = user_id)';
    end if;
  end if;
end $$;

-- lead_draft_versions table
do $$
begin
  if to_regclass('public.lead_draft_versions') is not null then
    execute 'alter table public.lead_draft_versions enable row level security';

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_draft_versions' and policyname = 'lead_drafts_select_own'
    ) then
      execute 'create policy lead_drafts_select_own on public.lead_draft_versions for select using (auth.uid() = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_draft_versions' and policyname = 'lead_drafts_insert_own'
    ) then
      execute 'create policy lead_drafts_insert_own on public.lead_draft_versions for insert with check (auth.uid() = user_id)';
    end if;
  end if;
end $$;
