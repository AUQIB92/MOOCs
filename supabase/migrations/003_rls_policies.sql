-- 003_rls_policies.sql
-- MOOC Management Platform - Row Level Security Policies

-- ============================================
-- ENABLE RLS
-- ============================================
alter table departments enable row level security;
alter table profiles enable row level security;
alter table mooc_courses enable row level security;
alter table curriculum_subjects enable row level security;
alter table mooc_mappings enable row level security;
alter table exam_cycles enable row level security;
alter table registrations enable row level security;
alter table results enable row level security;
alter table audit_logs enable row level security;

-- ============================================
-- DEPARTMENTS
-- ============================================
create policy "Departments are viewable by authenticated users"
  on departments for select using (auth.role() = 'authenticated');

-- ============================================
-- PROFILES
-- ============================================
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Admins and faculty can view all profiles"
  on profiles for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'faculty_coordinator')
    )
  );

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ============================================
-- MOOC COURSES
-- ============================================
create policy "MOOC courses viewable by authenticated"
  on mooc_courses for select using (auth.role() = 'authenticated');

create policy "Admins and faculty can manage MOOC courses"
  on mooc_courses for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'faculty_coordinator')
    )
  );

-- ============================================
-- CURRICULUM SUBJECTS
-- ============================================
create policy "Curriculum subjects viewable by authenticated"
  on curriculum_subjects for select using (auth.role() = 'authenticated');

create policy "Admins and faculty can manage curriculum subjects"
  on curriculum_subjects for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'faculty_coordinator')
    )
  );

-- ============================================
-- MOOC MAPPINGS
-- ============================================
create policy "MOOC mappings viewable by authenticated"
  on mooc_mappings for select using (auth.role() = 'authenticated');

create policy "Admins and faculty can manage MOOC mappings"
  on mooc_mappings for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'faculty_coordinator')
    )
  );

-- ============================================
-- EXAM CYCLES
-- ============================================
create policy "Exam cycles viewable by authenticated"
  on exam_cycles for select using (auth.role() = 'authenticated');

create policy "Admins can manage exam cycles"
  on exam_cycles for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- REGISTRATIONS
-- ============================================
create policy "Students can view own registrations"
  on registrations for select using (student_id = auth.uid());

create policy "Admins and faculty can view all registrations"
  on registrations for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'faculty_coordinator')
    )
  );

create policy "Students can create registrations"
  on registrations for insert with check (student_id = auth.uid());

create policy "Students can update own pending registrations"
  on registrations for update using (student_id = auth.uid() and status = 'pending');

create policy "Admins and faculty can update registrations"
  on registrations for update using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'faculty_coordinator')
    )
  );

-- ============================================
-- RESULTS
-- ============================================
create policy "Students can view own results"
  on results for select using (
    exists (
      select 1 from registrations
      where registrations.id = results.registration_id
      and registrations.student_id = auth.uid()
    )
  );

create policy "Admins and faculty can view all results"
  on results for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'faculty_coordinator')
    )
  );

create policy "Students can create results"
  on results for insert with check (
    exists (
      select 1 from registrations
      where registrations.id = registration_id
      and registrations.student_id = auth.uid()
    )
  );

create policy "Students can update own pending results"
  on results for update using (
    exists (
      select 1 from registrations
      where registrations.id = results.registration_id
      and registrations.student_id = auth.uid()
    )
    and status = 'pending'
  );

create policy "Admins and faculty can verify results"
  on results for update using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'faculty_coordinator')
    )
  );

-- ============================================
-- AUDIT LOGS
-- ============================================
create policy "Admins can view audit logs"
  on audit_logs for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
