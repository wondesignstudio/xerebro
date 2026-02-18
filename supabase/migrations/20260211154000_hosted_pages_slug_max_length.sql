-- Enforce hosted page slug max length for new/updated rows.
do $$
begin
  if to_regclass('public.hosted_pages') is not null
    and not exists (
      select 1
      from pg_constraint
      where conname = 'hosted_pages_slug_max_length'
        and conrelid = 'public.hosted_pages'::regclass
    ) then
    -- NOT VALID keeps existing legacy rows untouched while enforcing new writes.
    execute '
      alter table public.hosted_pages
      add constraint hosted_pages_slug_max_length
      check (char_length(slug) <= 40) not valid
    ';
  end if;
end $$;
