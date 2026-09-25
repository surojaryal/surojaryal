-- Haverton Recruitment: candidate CV database (run once in the Supabase SQL Editor).
-- The public registration page (operation.havertoncare.co.uk/apply/) can ONLY add an application
-- and upload a CV. It can never read, list, change or delete anything. Only signed-in members
-- listed in ops.allowed_users can see applications and open CVs.

-- 1. Applications table ---------------------------------------------------------------
create table if not exists ops.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (char_length(phone) <= 40),
  postcode text check (char_length(postcode) <= 10),
  target_role text not null check (char_length(target_role) <= 80),
  other_roles text check (char_length(other_roles) <= 200),
  work_type text check (work_type in ('Permanent', 'Temporary when available', 'Both')),
  availability text check (char_length(availability) <= 200),
  travel_miles int check (travel_miles between 0 and 100),
  drives boolean,
  right_to_work text check (right_to_work in ('Yes', 'No', 'Not sure')),
  experience_years int check (experience_years between 0 and 60),
  quals text[] not null default '{}' check (cardinality(quals) <= 25),
  about text check (char_length(about) <= 1500),
  cv_path text check (cv_path is null or cv_path ~ '^incoming/[0-9a-f-]{36}\.(pdf|docx?|PDF|DOCX?)$'),
  privacy_version text not null check (char_length(privacy_version) <= 40),
  marketing_consent boolean not null default false,
  source text check (char_length(source) <= 80),
  status text not null default 'New' check (status in ('New', 'Reviewed', 'Added', 'Not suitable', 'Withdrawn')),
  candidate_id text,
  reviewed_by text,
  review_note text check (char_length(review_note) <= 1000)
);
alter table ops.applications enable row level security;
alter table ops.applications force row level security;

-- Stop floods and repeat submissions (runs with owner rights, so the public never needs read access)
create or replace function ops_private.applications_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if (select count(*) from ops.applications a where lower(a.email) = lower(new.email) and a.created_at > now() - interval '1 day') >= 3 then
      raise exception 'Too many applications from this email today. Please contact us instead.';
    end if;
    if (select count(*) from ops.applications a where a.created_at > now() - interval '1 hour') >= 100 then
      raise exception 'We are receiving a lot of applications. Please try again later.';
    end if;
    new.email := lower(trim(new.email));
    new.status := 'New'; new.candidate_id := null; new.reviewed_by := null; new.review_note := null;
    new.created_at := now();
  end if;
  new.updated_at := now();
  if tg_op = 'UPDATE' then new.reviewed_by := ops_private.current_email(); end if;
  return new;
end $$;
drop trigger if exists applications_guard on ops.applications;
create trigger applications_guard before insert or update on ops.applications for each row execute function ops_private.applications_guard();

drop policy if exists app_public_insert on ops.applications;
create policy app_public_insert on ops.applications for insert to anon, authenticated with check (status = 'New' and candidate_id is null);
drop policy if exists app_select on ops.applications;
create policy app_select on ops.applications for select to authenticated using (ops_private.is_member());
drop policy if exists app_update on ops.applications;
create policy app_update on ops.applications for update to authenticated using (ops_private.can_write()) with check (ops_private.can_write());
drop policy if exists app_delete on ops.applications;
create policy app_delete on ops.applications for delete to authenticated using (ops_private.can_write());

-- The public role may reach the ops schema only to add an application. It has no rights on any other table.
grant usage on schema ops to anon;
grant insert (full_name, email, phone, postcode, target_role, other_roles, work_type, availability, travel_miles, drives,
  right_to_work, experience_years, quals, about, cv_path, privacy_version, marketing_consent, source) on ops.applications to anon;
grant select, insert, update, delete on ops.applications to authenticated;
revoke execute on function ops_private.applications_guard() from public, anon, authenticated;

-- 2. Private CV storage -----------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 5242880, array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists cvs_public_upload on storage.objects;
create policy cvs_public_upload on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'incoming' and name ~ '^incoming/[0-9a-f-]{36}\.(pdf|docx?|PDF|DOCX?)$');
drop policy if exists cvs_member_read on storage.objects;
create policy cvs_member_read on storage.objects for select to authenticated using (bucket_id = 'cvs' and ops_private.is_member());
drop policy if exists cvs_member_delete on storage.objects;
create policy cvs_member_delete on storage.objects for delete to authenticated using (bucket_id = 'cvs' and ops_private.can_write());

-- 3. Check: this should list 4 policies on ops.applications and 3 on storage.objects for cvs
select 'applications' as area, policyname from pg_policies where schemaname = 'ops' and tablename = 'applications'
union all
select 'cv storage', policyname from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'cvs_%';
