-- Context Links schema for connecting leads to hosted pages.

create table if not exists public.context_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  hosted_page_id uuid not null references public.hosted_pages(id) on delete cascade,
  slug varchar not null unique,
  target_message text,
  click_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table if exists public.context_links
  add column if not exists user_id uuid,
  add column if not exists lead_id uuid,
  add column if not exists hosted_page_id uuid,
  add column if not exists slug varchar,
  add column if not exists target_message text,
  add column if not exists click_count int default 0,
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamp default now(),
  add column if not exists updated_at timestamp default now();

create unique index if not exists context_links_slug_idx on public.context_links (slug);
create index if not exists context_links_user_id_idx on public.context_links (user_id);
create index if not exists context_links_lead_id_idx on public.context_links (lead_id);
create index if not exists context_links_hosted_page_id_idx on public.context_links (hosted_page_id);
create index if not exists context_links_is_active_idx on public.context_links (is_active);

-- Atomic click counter update for public redirect route.
create or replace function public.increment_context_link_click_count(
  p_context_link_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.context_links
     set click_count = click_count + 1,
         updated_at = now()
   where id = p_context_link_id;
end;
$$;

revoke all on function public.increment_context_link_click_count(uuid) from public;
grant execute on function public.increment_context_link_click_count(uuid) to authenticated;
grant execute on function public.increment_context_link_click_count(uuid) to service_role;

-- Enable RLS and add user-scoped policies.
do $$
begin
  if to_regclass('public.context_links') is not null then
    execute 'alter table public.context_links enable row level security';

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'context_links' and policyname = 'context_links_select_own'
    ) then
      execute 'create policy context_links_select_own on public.context_links for select using (auth.uid() = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'context_links' and policyname = 'context_links_insert_own'
    ) then
      execute 'create policy context_links_insert_own on public.context_links for insert with check (auth.uid() = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'context_links' and policyname = 'context_links_update_own'
    ) then
      execute 'create policy context_links_update_own on public.context_links for update using (auth.uid() = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'context_links' and policyname = 'context_links_delete_own'
    ) then
      execute 'create policy context_links_delete_own on public.context_links for delete using (auth.uid() = user_id)';
    end if;
  end if;
end $$;
