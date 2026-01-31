alter table if exists leads
  add column if not exists draft_message text;

create table if not exists lead_draft_versions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id),
  user_id uuid not null references users(id),
  draft_message text not null,
  created_at timestamp default now()
);

create index if not exists lead_draft_versions_lead_id_idx
  on lead_draft_versions (lead_id, created_at desc);
