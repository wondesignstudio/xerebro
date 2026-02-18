-- Ensure abuse_restriction enum value exists if transactions.type is an enum.
do $$
declare
  v_type_name text;
  v_type_kind text;
begin
  select t.typname, t.typtype
    into v_type_name, v_type_kind
    from pg_type t
    join pg_attribute a on a.atttypid = t.oid
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
   where c.relname = 'transactions'
     and a.attname = 'type'
     and n.nspname = 'public';

  -- Only alter enum types. Skip plain text columns.
  if v_type_name is not null and v_type_kind = 'e' then
    execute format('alter type %I add value if not exists ''abuse_restriction''', v_type_name);
  end if;
end $$;

-- Atomic ledger deduction: updates wallet and writes transaction in one DB transaction.
create or replace function ledger_deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_description text,
  p_related_lead_id uuid default null
) returns wallets
language plpgsql
as $$
declare
  v_wallet wallets%rowtype;
  v_free integer;
  v_subscription integer;
  v_purchased integer;
  v_remaining integer;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be a positive integer.';
  end if;

  select *
    into v_wallet
    from wallets
   where user_id = p_user_id
   for update;

  if not found then
    raise exception 'Wallet not found for user.';
  end if;

  v_remaining := p_amount;

  v_free := greatest(coalesce(v_wallet.free_credits, 0) - v_remaining, 0);
  v_remaining := greatest(v_remaining - coalesce(v_wallet.free_credits, 0), 0);

  v_subscription := greatest(coalesce(v_wallet.subscription_credits, 0) - v_remaining, 0);
  v_remaining := greatest(v_remaining - coalesce(v_wallet.subscription_credits, 0), 0);

  v_purchased := greatest(coalesce(v_wallet.purchased_credits, 0) - v_remaining, 0);
  v_remaining := greatest(v_remaining - coalesce(v_wallet.purchased_credits, 0), 0);

  if v_remaining > 0 then
    raise exception 'Insufficient credits.';
  end if;

  update wallets
     set free_credits = v_free,
         subscription_credits = v_subscription,
         purchased_credits = v_purchased
   where user_id = p_user_id
   returning * into v_wallet;

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
    -p_amount,
    p_type,
    p_description,
    p_related_lead_id
  );

  return v_wallet;
end;
$$;
