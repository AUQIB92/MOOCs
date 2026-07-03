-- 002_indexes_and_triggers.sql
-- MOOC Management Platform - Indexes and Triggers

-- ============================================
-- INDEXES
-- ============================================
create index idx_profiles_role on profiles(role);
create index idx_profiles_department on profiles(department_id);
create index idx_mooc_courses_active on mooc_courses(is_active);
create index idx_curriculum_subjects_dept on curriculum_subjects(department_id);
create index idx_registrations_student on registrations(student_id);
create index idx_registrations_status on registrations(status);
create index idx_registrations_exam_cycle on registrations(exam_cycle_id);
create index idx_results_registration on results(registration_id);
create index idx_results_status on results(status);
create index idx_audit_logs_user on audit_logs(user_id);
create index idx_audit_logs_created on audit_logs(created_at);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_mooc_courses_updated_at before update on mooc_courses
  for each row execute function update_updated_at_column();

create trigger update_registrations_updated_at before update on registrations
  for each row execute function update_updated_at_column();

create trigger update_results_updated_at before update on results
  for each row execute function update_updated_at_column();

-- ============================================
-- AUTO CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
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
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
