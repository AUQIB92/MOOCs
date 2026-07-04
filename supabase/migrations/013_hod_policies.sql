-- 013_hod_policies.sql
-- Department-scoped write access for Head of Department (HoD) users.
--
-- A HoD is a profile with role = 'hod' and a department_id. They can manage:
--   * curriculum_subjects for their own department
--   * mooc_courses (the shared, college-wide catalog)
--   * mooc_mappings whose curriculum subject belongs to their department
--
-- Role/department are resolved via SECURITY DEFINER helpers so the policy's
-- internal SELECT on `profiles` bypasses RLS and avoids the recursion issue
-- fixed in 009. Comparisons use ::text so this DDL never binds the 'hod' enum
-- literal at parse time (robust regardless of how migrations are applied).

-- ============================================
-- HELPER: current user's department
-- ============================================
create or replace function public.current_user_department()
returns uuid
language sql
security definer
stable
as $$
  select department_id from public.profiles where id = auth.uid()
$$;

-- ============================================
-- CURRICULUM SUBJECTS (own department only)
-- ============================================
drop policy if exists "HoDs manage own department curriculum subjects" on curriculum_subjects;
create policy "HoDs manage own department curriculum subjects"
  on curriculum_subjects for all
  using (
    public.current_user_role()::text = 'hod'
    and department_id = public.current_user_department()
  )
  with check (
    public.current_user_role()::text = 'hod'
    and department_id = public.current_user_department()
  );

-- ============================================
-- MOOC COURSES (shared catalog)
-- ============================================
drop policy if exists "HoDs manage MOOC courses" on mooc_courses;
create policy "HoDs manage MOOC courses"
  on mooc_courses for all
  using (public.current_user_role()::text = 'hod')
  with check (public.current_user_role()::text = 'hod');

-- ============================================
-- MOOC MAPPINGS (mappings for own department's subjects)
-- ============================================
drop policy if exists "HoDs manage mappings for own department" on mooc_mappings;
create policy "HoDs manage mappings for own department"
  on mooc_mappings for all
  using (
    public.current_user_role()::text = 'hod'
    and exists (
      select 1 from curriculum_subjects cs
      where cs.id = mooc_mappings.curriculum_subject_id
        and cs.department_id = public.current_user_department()
    )
  )
  with check (
    public.current_user_role()::text = 'hod'
    and exists (
      select 1 from curriculum_subjects cs
      where cs.id = curriculum_subject_id
        and cs.department_id = public.current_user_department()
    )
  );
