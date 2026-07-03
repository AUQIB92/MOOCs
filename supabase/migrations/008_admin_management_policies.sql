-- 008_admin_management_policies.sql
-- MOOC Management Platform - Admin management RLS policies
-- Adds the write access admins need for the Departments and Users admin pages.
-- Without this, admin insert/update/delete on departments and admin edits to
-- other users' profiles fail RLS silently.

-- ============================================
-- DEPARTMENTS
-- ============================================
create policy "Admins can manage departments"
  on departments for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  ) with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- PROFILES
-- ============================================
-- Additive to "Users can update own profile" (permissive policies OR-combine),
-- so self-update by non-admins is unaffected.
create policy "Admins can update any profile"
  on profiles for update using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  ) with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
