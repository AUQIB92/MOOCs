-- 011_fix_handle_new_user_search_path.sql
-- Fixes "Database error saving new user": the signup trigger runs under
-- supabase_auth_admin's restricted search_path, so the unqualified `user_role`
-- enum cast fails to resolve and the profile insert throws. Pinning
-- search_path = public makes the type (and table) resolve reliably.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, department_id, enrollment_number, semester)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'),
    nullif(new.raw_user_meta_data->>'department_id', '')::uuid,
    nullif(new.raw_user_meta_data->>'enrollment_number', ''),
    nullif(new.raw_user_meta_data->>'semester', '')::int
  );
  return new;
end;
$$;

-- Backfill profiles for any auth users created during debugging that ended up
-- without a profile row (trigger previously swallowed the error).
insert into public.profiles (id, email, full_name, role, department_id, enrollment_number, semester)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  coalesce((u.raw_user_meta_data->>'role')::user_role, 'student'),
  nullif(u.raw_user_meta_data->>'department_id', '')::uuid,
  nullif(u.raw_user_meta_data->>'enrollment_number', ''),
  nullif(u.raw_user_meta_data->>'semester', '')::int
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
