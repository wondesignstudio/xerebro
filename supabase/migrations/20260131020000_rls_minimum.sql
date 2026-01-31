-- Enable RLS and add minimal policies for user-owned tables.

-- users table
alter table if exists public.users enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'users_select_own'
  ) then
    create policy users_select_own on public.users
      for select using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'users_insert_own'
  ) then
    create policy users_insert_own on public.users
      for insert with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'users_update_own'
  ) then
    create policy users_update_own on public.users
      for update using (auth.uid() = id);
  end if;
end $$;

-- wallets table
alter table if exists public.wallets enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'wallets' and policyname = 'wallets_select_own'
  ) then
    create policy wallets_select_own on public.wallets
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'wallets' and policyname = 'wallets_insert_own'
  ) then
    create policy wallets_insert_own on public.wallets
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'wallets' and policyname = 'wallets_update_own'
  ) then
    create policy wallets_update_own on public.wallets
      for update using (auth.uid() = user_id);
  end if;
end $$;

-- transactions table
alter table if exists public.transactions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'transactions_select_own'
  ) then
    create policy transactions_select_own on public.transactions
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'transactions_insert_own'
  ) then
    create policy transactions_insert_own on public.transactions
      for insert with check (auth.uid() = user_id);
  end if;
end $$;

-- lead_reports table
alter table if exists public.lead_reports enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_reports' and policyname = 'lead_reports_select_own'
  ) then
    create policy lead_reports_select_own on public.lead_reports
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_reports' and policyname = 'lead_reports_insert_own'
  ) then
    create policy lead_reports_insert_own on public.lead_reports
      for insert with check (auth.uid() = user_id);
  end if;
end $$;

-- lead_draft_versions table
alter table if exists public.lead_draft_versions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_draft_versions' and policyname = 'lead_drafts_select_own'
  ) then
    create policy lead_drafts_select_own on public.lead_draft_versions
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_draft_versions' and policyname = 'lead_drafts_insert_own'
  ) then
    create policy lead_drafts_insert_own on public.lead_draft_versions
      for insert with check (auth.uid() = user_id);
  end if;
end $$;

-- lead_notifications table
alter table if exists public.lead_notifications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_notifications' and policyname = 'lead_notifications_select_own'
  ) then
    create policy lead_notifications_select_own on public.lead_notifications
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_notifications' and policyname = 'lead_notifications_insert_own'
  ) then
    create policy lead_notifications_insert_own on public.lead_notifications
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_notifications' and policyname = 'lead_notifications_update_own'
  ) then
    create policy lead_notifications_update_own on public.lead_notifications
      for update using (auth.uid() = user_id);
  end if;
end $$;
