create table if not exists lead_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  type text not null default 'initial_search',
  status text not null default 'pending',
  created_at timestamp default now()
);

create index if not exists lead_notifications_user_id_idx
  on lead_notifications (user_id);

create unique index if not exists lead_notifications_user_type_idx
  on lead_notifications (user_id, type);
