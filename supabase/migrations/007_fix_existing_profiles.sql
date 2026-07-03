-- 007_fix_existing_profiles.sql
-- Update existing profiles with missing data from auth.users raw_user_meta_data

update public.profiles p
set 
  department_id = coalesce(p.department_id, nullif(u.raw_user_meta_data->>'department_id', '')::uuid),
  enrollment_number = coalesce(p.enrollment_number, nullif(u.raw_user_meta_data->>'enrollment_number', '')),
  semester = coalesce(p.semester, nullif(u.raw_user_meta_data->>'semester', '')::int)
from auth.users u
where p.id = u.id
  and (p.department_id is null or p.enrollment_number is null or p.semester is null);
