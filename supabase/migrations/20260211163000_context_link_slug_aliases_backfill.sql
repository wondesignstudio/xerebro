-- Legacy context-link slug compatibility and backfill for max-length enforcement.

create table if not exists public.context_link_slug_aliases (
  id uuid primary key default gen_random_uuid(),
  context_link_id uuid not null references public.context_links(id) on delete cascade,
  old_slug varchar not null unique,
  created_at timestamp default now()
);

alter table if exists public.context_link_slug_aliases
  add column if not exists context_link_id uuid,
  add column if not exists old_slug varchar,
  add column if not exists created_at timestamp default now();

create unique index if not exists context_link_slug_aliases_old_slug_idx
  on public.context_link_slug_aliases (old_slug);

create index if not exists context_link_slug_aliases_context_link_id_idx
  on public.context_link_slug_aliases (context_link_id);

do $$
begin
  if to_regclass('public.context_link_slug_aliases') is not null then
    execute 'alter table public.context_link_slug_aliases enable row level security';
  end if;
end $$;

-- Add length guard before validation/backfill.
do $$
begin
  if to_regclass('public.context_links') is not null
    and not exists (
      select 1
      from pg_constraint
      where conname = 'context_links_slug_max_length'
        and conrelid = 'public.context_links'::regclass
    ) then
    execute '
      alter table public.context_links
      add constraint context_links_slug_max_length
      check (char_length(slug) <= 40) not valid
    ';
  end if;
end $$;

-- Backfill legacy long slugs and preserve old public paths via alias rows.
do $$
declare
  v_row record;
  v_old_slug text;
  v_new_slug text;
begin
  if to_regclass('public.context_links') is null then
    return;
  end if;

  for v_row in
    select id, slug
    from public.context_links
    where char_length(slug) > 40
  loop
    v_old_slug := lower(trim(v_row.slug));
    v_new_slug := lower('legacyc-' || replace(v_row.id::text, '-', ''));

    insert into public.context_link_slug_aliases (context_link_id, old_slug)
    values (v_row.id, v_old_slug)
    on conflict (old_slug) do nothing;

    if exists (
      select 1
      from public.context_links cl
      where cl.slug = v_new_slug
        and cl.id <> v_row.id
    ) then
      v_new_slug := lower('legacyc-' || substr(md5(v_row.id::text || coalesce(v_old_slug, '')), 1, 32));
    end if;

    update public.context_links
       set slug = v_new_slug,
           updated_at = now()
     where id = v_row.id
       and slug <> v_new_slug;
  end loop;
end $$;

do $$
begin
  if to_regclass('public.context_links') is not null
    and exists (
      select 1
      from pg_constraint
      where conname = 'context_links_slug_max_length'
        and conrelid = 'public.context_links'::regclass
    ) then
    execute 'alter table public.context_links validate constraint context_links_slug_max_length';
  end if;
end $$;
