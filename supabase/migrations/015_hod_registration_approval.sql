-- 015_hod_registration_approval.sql
-- Enrollment-registration approval belongs to the STUDENT'S department HoD.
-- Admins and faculty coordinators can still VIEW registrations (oversight) but
-- may no longer approve/reject them.
--
-- Note: policies that need the student's department can't simply query profiles,
-- because a HoD has no RLS read access to other users' profile rows. We resolve
-- the department via a SECURITY DEFINER helper (bypasses RLS) and also grant
-- HoDs read access to their own department's profiles so the registrations
-- screen can display student details.

-- ============================================
-- HELPER: a student's department (definer rights)
-- ============================================
create or replace function public.student_department(p_student uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select department_id from public.profiles where id = p_student
$$;

-- ============================================
-- PROFILES: HoDs can read their own department's profiles
-- ============================================
drop policy if exists "HoDs can view own department profiles" on profiles;
create policy "HoDs can view own department profiles"
  on profiles for select
  using (
    public.current_user_role()::text = 'hod'
    and department_id = public.current_user_department()
  );

-- ============================================
-- REGISTRATIONS: move approval to the department HoD
-- ============================================
-- Remove admin + faculty coordinator approval (they keep the separate
-- "Admins and faculty can view all registrations" SELECT policy).
drop policy if exists "Admins and faculty can update registrations" on registrations;

-- HoDs can see their department's registrations...
drop policy if exists "HoDs view own department registrations" on registrations;
create policy "HoDs view own department registrations"
  on registrations for select
  using (
    public.current_user_role()::text = 'hod'
    and public.student_department(student_id) = public.current_user_department()
  );

-- ...and approve/reject them.
drop policy if exists "HoDs update own department registrations" on registrations;
create policy "HoDs update own department registrations"
  on registrations for update
  using (
    public.current_user_role()::text = 'hod'
    and public.student_department(student_id) = public.current_user_department()
  )
  with check (
    public.current_user_role()::text = 'hod'
    and public.student_department(student_id) = public.current_user_department()
  );
