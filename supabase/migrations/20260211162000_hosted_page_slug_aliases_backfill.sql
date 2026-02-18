-- Legacy hosted-page slug compatibility and backfill for max-length enforcement.

create table if not exists public.hosted_page_slug_aliases (
  id uuid primary key default gen_random_uuid(),
  hosted_page_id uuid not null references public.hosted_pages(id) on delete cascade,
  old_slug varchar not null unique,
  created_at timestamp default now()
);

alter table if exists public.hosted_page_slug_aliases
  add column if not exists hosted_page_id uuid,
  add column if not exists old_slug varchar,
  add column if not exists created_at timestamp default now();

create unique index if not exists hosted_page_slug_aliases_old_slug_idx
  on public.hosted_page_slug_aliases (old_slug);

create index if not exists hosted_page_slug_aliases_hosted_page_id_idx
  on public.hosted_page_slug_aliases (hosted_page_id);

-- Keep alias table protected from direct client reads/writes.
do $$
begin
  if to_regclass('public.hosted_page_slug_aliases') is not null then
    execute 'alter table public.hosted_page_slug_aliases enable row level security';
  end if;
end $$;

-- Backfill legacy long slugs and preserve old public paths via alias rows.
do $$
declare
  v_row record;
  v_old_slug text;
  v_new_slug text;
begin
  if to_regclass('public.hosted_pages') is null then
    return;
  end if;

  for v_row in
    select id, slug
    from public.hosted_pages
    where char_length(slug) > 40
  loop
    v_old_slug := lower(trim(v_row.slug));
    v_new_slug := lower('legacy-' || replace(v_row.id::text, '-', ''));

    insert into public.hosted_page_slug_aliases (hosted_page_id, old_slug)
    values (v_row.id, v_old_slug)
    on conflict (old_slug) do nothing;

    -- Fallback only for edge cases where the deterministic slug already exists.
    if exists (
      select 1
      from public.hosted_pages hp
      where hp.slug = v_new_slug
        and hp.id <> v_row.id
    ) then
      v_new_slug := lower('legacy-' || substr(md5(v_row.id::text || coalesce(v_old_slug, '')), 1, 32));
    end if;

    update public.hosted_pages
       set slug = v_new_slug,
           updated_at = now()
     where id = v_row.id
       and slug <> v_new_slug;
  end loop;
end $$;

-- Validate the max-length constraint after backfill.
do $$
begin
  if to_regclass('public.hosted_pages') is not null
    and exists (
      select 1
      from pg_constraint
      where conname = 'hosted_pages_slug_max_length'
        and conrelid = 'public.hosted_pages'::regclass
    ) then
    execute 'alter table public.hosted_pages validate constraint hosted_pages_slug_max_length';
  end if;
end $$;
