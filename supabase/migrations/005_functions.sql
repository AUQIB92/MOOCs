-- 005_functions.sql
-- MOOC Management Platform - Helper Functions

-- ============================================
-- ADMIN DASHBOARD STATS
-- ============================================
create or replace function get_dashboard_stats()
returns jsonb
language plpgsql
security definer
as $$
declare
  stats jsonb;
begin
  select jsonb_build_object(
    'totalStudents', (select count(*) from profiles where role = 'student'),
    'totalRegistrations', (select count(*) from registrations),
    'pendingVerifications', (select count(*) from results where status = 'pending'),
    'completedCourses', (select count(*) from results where status = 'verified'),
    'totalCourses', (select count(*) from mooc_courses where is_active = true),
    'activeExamCycles', (select count(*) from exam_cycles where is_active = true)
  ) into stats;
  return stats;
end;
$$;

-- ============================================
-- STUDENT STATS
-- ============================================
create or replace function get_student_stats(p_student_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  stats jsonb;
begin
  select jsonb_build_object(
    'totalRegistrations', (select count(*) from registrations where student_id = p_student_id),
    'pendingRegistrations', (select count(*) from registrations where student_id = p_student_id and status = 'pending'),
    'completedCourses', (select count(*) from results r join registrations reg on r.registration_id = reg.id where reg.student_id = p_student_id and r.status = 'verified'),
    'verifiedResults', (select count(*) from results r join registrations reg on r.registration_id = reg.id where reg.student_id = p_student_id and r.status = 'verified'),
    'totalCredits', (
      select coalesce(sum(mc.credits), 0)
      from results r
      join registrations reg on r.registration_id = reg.id
      join mooc_courses mc on reg.mooc_course_id = mc.id
      where reg.student_id = p_student_id and r.status = 'verified'
    )
  ) into stats;
  return stats;
end;
$$;
