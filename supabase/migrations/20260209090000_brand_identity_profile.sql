-- Brand Identity profile fields for core interview and persona tuning.
alter table if exists public.users
  add column if not exists brand_industry text,
  add column if not exists brand_target_audience text,
  add column if not exists brand_usp text,
  add column if not exists persona_tone text,
  add column if not exists persona_guideline text;
