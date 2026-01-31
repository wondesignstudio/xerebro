-- Ensure report_reward enum value exists if transactions.type is an enum.
do $$
declare
  v_type_name text;
begin
  select t.typname
    into v_type_name
    from pg_type t
    join pg_attribute a on a.atttypid = t.oid
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
   where c.relname = 'transactions'
     and a.attname = 'type'
     and n.nspname = 'public';

  if v_type_name is not null then
    execute format('alter type %I add value if not exists ''report_reward''', v_type_name);
  end if;
end $$;

create table if not exists lead_reports (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id),
  user_id uuid not null references users(id),
  reason_code text not null,
  reason_detail text,
  created_at timestamp default now()
);

create unique index if not exists lead_reports_unique
  on lead_reports (lead_id, user_id);

-- Atomic reward: records report, grants free credit, logs transaction, and updates lead status.
create or replace function ledger_reward_credits(
  p_user_id uuid,
  p_lead_id uuid,
  p_reason_code text,
  p_reason_detail text,
  p_description text
) returns wallets
language plpgsql
as $$
declare
  v_wallet wallets%rowtype;
  v_report_exists boolean;
begin
  select exists(
    select 1 from lead_reports where lead_id = p_lead_id and user_id = p_user_id
  ) into v_report_exists;

  if v_report_exists then
    raise exception 'Report already exists.';
  end if;

  select *
    into v_wallet
    from wallets
   where user_id = p_user_id
   for update;

  if not found then
    raise exception 'Wallet not found for user.';
  end if;

  insert into lead_reports (
    id,
    lead_id,
    user_id,
    reason_code,
    reason_detail
  ) values (
    gen_random_uuid(),
    p_lead_id,
    p_user_id,
    p_reason_code,
    p_reason_detail
  );

  update wallets
     set free_credits = coalesce(free_credits, 0) + 1
   where user_id = p_user_id;

  insert into transactions (
    id,
    user_id,
    amount,
    type,
    description,
    related_lead_id
  ) values (
    gen_random_uuid(),
    p_user_id,
    1,
    'report_reward',
    p_description,
    p_lead_id
  );

  update leads
     set status = 'reported'
   where id = p_lead_id;

  return (select * from wallets where user_id = p_user_id);
end;
$$;
