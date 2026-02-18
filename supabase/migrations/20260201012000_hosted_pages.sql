-- Hosted Pages schema and RLS policies (Pro feature).

create table if not exists public.hosted_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  slug varchar not null unique,
  layout_config jsonb not null default '{}'::jsonb,
  theme_color varchar,
  og_image_url text,
  is_published boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table if exists public.hosted_pages
  add column if not exists user_id uuid,
  add column if not exists slug varchar,
  add column if not exists layout_config jsonb default '{}'::jsonb,
  add column if not exists theme_color varchar,
  add column if not exists og_image_url text,
  add column if not exists is_published boolean default false,
  add column if not exists created_at timestamp default now(),
  add column if not exists updated_at timestamp default now();

create unique index if not exists hosted_pages_slug_idx on public.hosted_pages (slug);
create index if not exists hosted_pages_user_id_idx on public.hosted_pages (user_id);
create index if not exists hosted_pages_updated_at_idx on public.hosted_pages (updated_at desc);

-- Enable RLS and add user-scoped policies.
do $$
begin
  if to_regclass('public.hosted_pages') is not null then
    execute 'alter table public.hosted_pages enable row level security';

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'hosted_pages' and policyname = 'hosted_pages_select_own'
    ) then
      execute 'create policy hosted_pages_select_own on public.hosted_pages for select using (auth.uid() = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'hosted_pages' and policyname = 'hosted_pages_insert_own'
    ) then
      execute 'create policy hosted_pages_insert_own on public.hosted_pages for insert with check (auth.uid() = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'hosted_pages' and policyname = 'hosted_pages_update_own'
    ) then
      execute 'create policy hosted_pages_update_own on public.hosted_pages for update using (auth.uid() = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'hosted_pages' and policyname = 'hosted_pages_delete_own'
    ) then
      execute 'create policy hosted_pages_delete_own on public.hosted_pages for delete using (auth.uid() = user_id)';
    end if;
  end if;
end $$;
