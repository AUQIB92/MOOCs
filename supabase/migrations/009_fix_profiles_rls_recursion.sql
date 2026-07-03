-- 009_fix_profiles_rls_recursion.sql
-- Fixes "infinite recursion detected in policy for relation profiles" (42P17).
-- Root cause: policies on `profiles` that check the caller's role by running
-- another SELECT against `profiles` re-trigger those same SELECT policies,
-- looping forever. Fix: check the role via a SECURITY DEFINER function, which
-- runs with bypass privileges so its internal query doesn't re-apply RLS.

create or replace function public.current_user_role()
returns user_role
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

drop policy if exists "Admins and faculty can view all profiles" on profiles;
create policy "Admins and faculty can view all profiles"
  on profiles for select using (
    public.current_user_role() in ('admin', 'faculty_coordinator')
  );

drop policy if exists "Admins can update any profile" on profiles;
create policy "Admins can update any profile"
  on profiles for update using (
    public.current_user_role() = 'admin'
  ) with check (
    public.current_user_role() = 'admin'
  );
