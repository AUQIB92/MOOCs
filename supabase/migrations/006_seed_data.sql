-- 006_seed_data.sql
-- MOOC Management Platform - Sample Seed Data

-- ============================================
-- DEPARTMENTS
-- ============================================
insert into departments (name, code) values
  ('Computer Science and Engineering', 'CSE'),
  ('Biomedical Engineering', 'BE'),
  ('Electrical and Electronics Engineering ', 'EEE'),
  ('Mechanical Engineering', 'ME'),
  ('Civil Engineering', 'CE');

-- ============================================
-- MOOC COURSES
-- ============================================
insert into mooc_courses (title, code, provider, credits, duration_weeks, description, external_url) values
  ('Introduction to Python Programming', 'PY101', 'Coursera', 4, 8, 'Learn Python from scratch with hands-on exercises', 'https://www.coursera.org/learn/python'),
  ('Data Structures and Algorithms', 'DSA201', 'NPTEL', 4, 12, 'Master DSA concepts for competitive programming', 'https://nptel.ac.in/courses/dsa'),
  ('Machine Learning Fundamentals', 'ML301', 'edX', 4, 10, 'Introduction to ML algorithms and applications', 'https://www.edx.org/learn/machine-learning'),
  ('Web Development Bootcamp', 'WD101', 'Udemy', 3, 6, 'Full-stack web development with modern frameworks', 'https://www.udemy.com/course/web-development'),
  ('Database Management Systems', 'DB201', 'NPTEL', 4, 8, 'Relational databases, SQL, and normalization', 'https://nptel.ac.in/courses/dbms'),
  ('Cloud Computing Essentials', 'CC301', 'AWS', 3, 4, 'AWS cloud services and architecture patterns', 'https://aws.training/cloud');

-- ============================================
-- CURRICULUM SUBJECTS
-- ============================================
insert into curriculum_subjects (name, code, credits, semester, department_id, subject_type, is_replaceable)
select 'Programming in Python', 'CS301', 4, 3, id, 'core', true from departments where code = 'CS';

insert into curriculum_subjects (name, code, credits, semester, department_id, subject_type, is_replaceable)
select 'Data Structures', 'CS202', 4, 2, id, 'core', true from departments where code = 'CS';

insert into curriculum_subjects (name, code, credits, semester, department_id, subject_type, is_replaceable)
select 'Machine Learning', 'CS401', 4, 5, id, 'elective', true from departments where code = 'CS';

insert into curriculum_subjects (name, code, credits, semester, department_id, subject_type, is_replaceable)
select 'Web Technologies', 'IT302', 3, 3, id, 'core', true from departments where code = 'IT';

insert into curriculum_subjects (name, code, credits, semester, department_id, subject_type, is_replaceable)
select 'Database Systems', 'CS302', 4, 4, id, 'core', true from departments where code = 'CS';

insert into curriculum_subjects (name, code, credits, semester, department_id, subject_type, is_replaceable)
select 'Cloud Computing', 'IT401', 3, 6, id, 'elective', true from departments where code = 'IT';

-- ============================================
-- MOOC MAPPINGS
-- ============================================
insert into mooc_mappings (mooc_course_id, curriculum_subject_id, min_score, elite_required)
select mc.id, cs.id, 60, 'none'
from mooc_courses mc, curriculum_subjects cs
where mc.code = 'PY101' and cs.code = 'CS301';

insert into mooc_mappings (mooc_course_id, curriculum_subject_id, min_score, elite_required)
select mc.id, cs.id, 50, 'none'
from mooc_courses mc, curriculum_subjects cs
where mc.code = 'DSA201' and cs.code = 'CS202';

insert into mooc_mappings (mooc_course_id, curriculum_subject_id, min_score, elite_required)
select mc.id, cs.id, 70, 'silver'
from mooc_courses mc, curriculum_subjects cs
where mc.code = 'ML301' and cs.code = 'CS401';

insert into mooc_mappings (mooc_course_id, curriculum_subject_id, min_score, elite_required)
select mc.id, cs.id, 55, 'none'
from mooc_courses mc, curriculum_subjects cs
where mc.code = 'WD101' and cs.code = 'IT302';

insert into mooc_mappings (mooc_course_id, curriculum_subject_id, min_score, elite_required)
select mc.id, cs.id, 60, 'none'
from mooc_courses mc, curriculum_subjects cs
where mc.code = 'DB201' and cs.code = 'CS302';

insert into mooc_mappings (mooc_course_id, curriculum_subject_id, min_score, elite_required)
select mc.id, cs.id, 65, 'silver'
from mooc_courses mc, curriculum_subjects cs
where mc.code = 'CC301' and cs.code = 'IT401';

-- ============================================
-- EXAM CYCLES
-- ============================================
insert into exam_cycles (name, start_date, end_date, registration_deadline, result_upload_enabled, result_upload_start, result_upload_end) values
  ('Spring 2026', '2026-01-15', '2026-05-30', '2026-02-01', true, '2026-06-01', '2026-06-30'),
  ('Fall 2026', '2026-08-01', '2026-12-15', '2026-08-20', true, '2027-01-01', '2027-01-31');
