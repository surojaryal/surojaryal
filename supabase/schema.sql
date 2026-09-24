-- Haverton Operations: cloud sync schema (Supabase, Postgres 15+)
-- Access model: only email addresses listed in ops.allowed_users can read or write anything.
-- Public sign-up is disabled at project level as well; the allowlist is a second, independent control.
-- Every change to a record is written to ops.audit_log by a trigger, with the signed-in user's email.

create schema if not exists ops;
revoke all on schema ops from public, anon;
grant usage on schema ops to authenticated;

-- Who may use the system
create table if not exists ops.allowed_users (
  email text primary key check (email = lower(email)),
  display_name text,
  role text not null default 'editor' check (role in ('owner', 'editor', 'viewer')),
  added_at timestamptz not null default now()
);

create or replace function ops.current_email() returns text
language sql stable security definer set search_path = '' as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

create or replace function ops.is_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from ops.allowed_users u where u.email = ops.current_email())
$$;

create or replace function ops.can_write() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from ops.allowed_users u where u.email = ops.current_email() and u.role in ('owner', 'editor'))
$$;

-- Register records (clients, candidates, vacancies, ...). data holds the field values.
create table if not exists ops.records (
  register text not null check (register ~ '^[a-z]{2,20}$'),
  id text not null check (id ~ '^[A-Z]{2}[0-9]{1,9}$'),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text not null default ops.current_email(),
  primary key (register, id)
);
create index if not exists records_updated_idx on ops.records (updated_at);

-- Activity notes against records
create table if not exists ops.activity (
  id text primary key check (id ~ '^AC[0-9A-Za-z_-]{1,40}$'),
  register text not null,
  rec_id text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text not null default ops.current_email()
);
create index if not exists activity_rec_idx on ops.activity (register, rec_id);
create index if not exists activity_updated_idx on ops.activity (updated_at);

-- Small shared settings: Go Live Gate sign-off, weekly scoreboard, ID counters
create table if not exists ops.settings (
  key text primary key check (key ~ '^[a-z_]{2,40}$'),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text not null default ops.current_email()
);

-- Tombstones so other devices learn about deletions
create table if not exists ops.deletions (
  kind text not null check (kind in ('record', 'activity')),
  register text not null default '',
  id text not null,
  deleted_at timestamptz not null default now(),
  deleted_by text not null default ops.current_email(),
  primary key (kind, register, id)
);
create index if not exists deletions_at_idx on ops.deletions (deleted_at);

-- Append-only audit trail, written only by triggers
create table if not exists ops.audit_log (
  seq bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor text not null,
  kind text not null,
  register text,
  id text,
  action text not null,
  fields text[] not null default '{}'
);
create index if not exists audit_rec_idx on ops.audit_log (register, id);

-- Encryption key for the site content, released only to members after sign-in
create table if not exists ops.site_secret (
  id int primary key default 1 check (id = 1),
  content_key text not null
);

-- Stamp updated_at / updated_by on every write so they cannot be forged by the client
create or replace function ops.stamp() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := ops.current_email();
  if tg_op = 'UPDATE' and tg_table_name in ('records', 'activity') then new.created_at := old.created_at; end if;
  return new;
end $$;

-- Used by records and activity (both have register, id and data)
create or replace function ops.audit() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  changed text[] := '{}';
  v_register text;
  v_id text;
begin
  if tg_op = 'DELETE' then
    v_register := old.register; v_id := old.id;
  else
    v_register := new.register; v_id := new.id;
  end if;
  if tg_op = 'UPDATE' then
    select coalesce(array_agg(k order by k), '{}') into changed
    from (select key as k from jsonb_each(new.data) union select key from jsonb_each(old.data)) keys
    where (new.data -> k) is distinct from (old.data -> k);
    if changed = '{}' then return new; end if;
  end if;
  insert into ops.audit_log (actor, kind, register, id, action, fields)
  values (ops.current_email(), tg_table_name, v_register, v_id, lower(tg_op), changed);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

-- settings has no register/id columns; give it its own audit function
create or replace function ops.audit_settings() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into ops.audit_log (actor, kind, register, id, action)
  values (ops.current_email(), 'settings', null, new.key, lower(tg_op));
  return new;
end $$;

drop trigger if exists records_stamp on ops.records;
create trigger records_stamp before insert or update on ops.records for each row execute function ops.stamp();
drop trigger if exists records_audit on ops.records;
create trigger records_audit after insert or update or delete on ops.records for each row execute function ops.audit();
drop trigger if exists activity_stamp on ops.activity;
create trigger activity_stamp before insert or update on ops.activity for each row execute function ops.stamp();
drop trigger if exists activity_audit on ops.activity;
create trigger activity_audit after insert or update or delete on ops.activity for each row execute function ops.audit();
drop trigger if exists settings_stamp on ops.settings;
create trigger settings_stamp before insert or update on ops.settings for each row execute function ops.stamp();
drop trigger if exists settings_audit on ops.settings;
create trigger settings_audit after insert or update on ops.settings for each row execute function ops.audit_settings();

-- Row level security: members read, owners/editors write, nobody edits the audit trail
alter table ops.allowed_users enable row level security;
alter table ops.records enable row level security;
alter table ops.activity enable row level security;
alter table ops.settings enable row level security;
alter table ops.deletions enable row level security;
alter table ops.audit_log enable row level security;
alter table ops.site_secret enable row level security;
alter table ops.allowed_users force row level security;
alter table ops.records force row level security;
alter table ops.activity force row level security;
alter table ops.settings force row level security;
alter table ops.deletions force row level security;
alter table ops.audit_log force row level security;
alter table ops.site_secret force row level security;

drop policy if exists members_read_self on ops.allowed_users;
create policy members_read_self on ops.allowed_users for select to authenticated using (ops.is_member());

drop policy if exists r_select on ops.records;
create policy r_select on ops.records for select to authenticated using (ops.is_member());
drop policy if exists r_insert on ops.records;
create policy r_insert on ops.records for insert to authenticated with check (ops.can_write());
drop policy if exists r_update on ops.records;
create policy r_update on ops.records for update to authenticated using (ops.can_write()) with check (ops.can_write());
drop policy if exists r_delete on ops.records;
create policy r_delete on ops.records for delete to authenticated using (ops.can_write());

drop policy if exists a_select on ops.activity;
create policy a_select on ops.activity for select to authenticated using (ops.is_member());
drop policy if exists a_insert on ops.activity;
create policy a_insert on ops.activity for insert to authenticated with check (ops.can_write());
drop policy if exists a_update on ops.activity;
create policy a_update on ops.activity for update to authenticated using (ops.can_write()) with check (ops.can_write());
drop policy if exists a_delete on ops.activity;
create policy a_delete on ops.activity for delete to authenticated using (ops.can_write());

drop policy if exists s_select on ops.settings;
create policy s_select on ops.settings for select to authenticated using (ops.is_member());
drop policy if exists s_insert on ops.settings;
create policy s_insert on ops.settings for insert to authenticated with check (ops.can_write());
drop policy if exists s_update on ops.settings;
create policy s_update on ops.settings for update to authenticated using (ops.can_write()) with check (ops.can_write());

drop policy if exists d_select on ops.deletions;
create policy d_select on ops.deletions for select to authenticated using (ops.is_member());
drop policy if exists d_insert on ops.deletions;
create policy d_insert on ops.deletions for insert to authenticated with check (ops.can_write());
drop policy if exists d_update on ops.deletions;
create policy d_update on ops.deletions for update to authenticated using (ops.can_write()) with check (ops.can_write());

drop policy if exists l_select on ops.audit_log;
create policy l_select on ops.audit_log for select to authenticated using (ops.is_member());

drop policy if exists k_select on ops.site_secret;
create policy k_select on ops.site_secret for select to authenticated using (ops.is_member());

-- Table privileges (RLS still applies on top)
grant select on ops.allowed_users, ops.audit_log, ops.site_secret to authenticated;
grant select, insert, update, delete on ops.records, ops.activity to authenticated;
grant select, insert, update on ops.settings, ops.deletions to authenticated;
revoke all on all tables in schema ops from anon;
revoke execute on all functions in schema ops from public, anon;
grant execute on function ops.current_email(), ops.is_member(), ops.can_write() to authenticated;
