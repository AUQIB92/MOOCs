-- 017_seed_july_dec_2026.sql
-- Populates MOOC courses, curriculum subjects and their mappings from the
-- official "Overall MOOC Course List July - Dec 2026" (GCET, SWAYAM/NPTEL).
--
-- ⚠️  DESTRUCTIVE: this first removes ALL existing mooc_courses,
-- curriculum_subjects and mooc_mappings. Because registrations/results
-- reference courses & subjects with ON DELETE CASCADE, any existing student
-- enrollments and results are removed too. Intended for a clean setup.
--
-- Notes on modelling:
--  * Each department's "Open Elective (OEC-xxx)" and "Programme Elective
--    (PEC)" slot is stored as its own per-department curriculum subject, so
--    the same OEC code can exist under several departments. These use normal
--    (own-department) visibility — is_open_elective stays false.
--  * The EEE list spans batches (2024/25 → PEC electives; 2023 → OEC
--    electives); the schema has no batch dimension, so EEE receives all of them.
--  * min_score defaults to 40 (typical NPTEL pass mark); adjust per policy.

begin;

-- ============================================
-- 0. CLEAN SLATE
-- ============================================
delete from mooc_mappings;
delete from mooc_courses;        -- cascades to registrations + results
delete from curriculum_subjects; -- cascades to any remaining registrations

-- ============================================
-- 1. DEPARTMENTS (ensure they exist; reference by code)
-- ============================================
insert into departments (name, code) values
  ('Computer Science and Engineering', 'CSE'),
  ('Biomedical Engineering', 'BE'),
  ('Electrical and Electronics Engineering', 'EEE'),
  ('Mechanical Engineering', 'ME'),
  ('Civil Engineering', 'CE')
on conflict (code) do nothing;

-- ============================================
-- 2. MOOC COURSES (10 unique NPTEL courses)
-- ============================================
insert into mooc_courses (title, code, provider, credits, duration_weeks, description, external_url, is_active) values
  ('Environmental Geomechanics', 'NPTEL-CE117', 'NPTEL', 3, 12, 'Prof. D. N. Singh, IIT Bombay', 'https://nptel.ac.in/courses/105101200', true),
  ('Remote Sensing for Natural Hazard Studies', 'NPTEL-CE160', 'NPTEL', 3, 12, 'Prof. Rishikesh Bharti, IIT Guwahati', 'https://nptel.ac.in/courses/105103692', true),
  ('The Joy of Computing using Python', 'NPTEL-CS136', 'NPTEL', 3, 12, 'Prof. Sudarshan Iyengar, IIT Ropar', 'https://nptel.ac.in/courses/106106182', true),
  ('Natural Language Processing', 'NPTEL-CS158', 'NPTEL', 3, 12, 'Prof. Pawan Goyal, IIT Kharagpur', 'https://nptel.ac.in/courses/106105158', true),
  ('Deep Learning', 'NPTEL-CS184', 'NPTEL', 3, 12, 'Prof. Sudarshan Iyengar, IIT Ropar', 'https://nptel.ac.in/courses/106106184', true),
  ('Biomedical Instrumentation', 'NPTEL-BM669', 'NPTEL', 3, 12, 'Prof. Varadhan SKM, IIT Madras', 'https://nptel.ac.in/courses/102106669', true),
  ('Advanced Power Electronics', 'NPTEL-EE134', 'NPTEL', 3, 12, 'Prof. Bhim Singh, IIT Delhi', 'https://onlinecourses.nptel.ac.in/e-learning/preview/noc26_ee134', true),
  ('Power System Protection', 'NPTEL-EE170', 'NPTEL', 3, 12, 'Prof. Ashok Kumar Pradhan, IIT Kharagpur', 'https://onlinecourses.nptel.ac.in/e-learning/preview/noc26_ee170', true),
  ('Fiber Optic Communication Technology', 'NPTEL-EE137', 'NPTEL', 3, 12, 'Prof. Deepa Venkitesh, IIT Madras', 'https://onlinecourses.nptel.ac.in/e-learning/preview/noc26_ee137', true),
  ('Computational Fluid Dynamics using the Finite Element Method', 'NPTEL-AE21', 'NPTEL', 3, 12, 'Prof. Sanjay Mittal, IIT Kanpur', 'https://onlinecourses.nptel.ac.in/e-learning/preview/noc26_ae21', true);

-- ============================================
-- 3. CURRICULUM SUBJECTS (per department, semester 8)
-- ============================================
insert into curriculum_subjects (name, code, credits, semester, department_id, subject_type, is_replaceable)
select s.name, s.code, 3, 8, d.id, 'elective', true
from (values
  ('BE',  'OEC-806', 'Environmental Science and Engineering'),
  ('BE',  'OEC-812', 'Introduction to Weather Forecasting'),
  ('BE',  'OEC-820', 'Introduction to Python Programming'),
  ('CSE', 'CS-802',  'Natural Language Processing'),
  ('CSE', 'CS-803',  'Deep Learning'),
  ('CSE', 'OEC-806', 'Environmental Science and Engineering'),
  ('CSE', 'OEC-812', 'Introduction to Weather Forecasting'),
  ('CSE', 'OEC-815', 'Biomedical Equipments'),
  ('EEE', 'EEE-801', 'Advanced Power Electronics'),
  ('EEE', 'EEE-802', 'Static Relay'),
  ('EEE', 'EEE-804', 'Optical Fiber Communication'),
  ('EEE', 'OEC-806', 'Environmental Science and Engineering'),
  ('EEE', 'OEC-812', 'Introduction to Weather Forecasting'),
  ('EEE', 'OEC-815', 'Biomedical Equipments'),
  ('EEE', 'OEC-820', 'Introduction to Python Programming'),
  ('ME',  'ME-801',  'FEM Application in Mechanical Engineering'),
  ('ME',  'OEC-806', 'Environmental Science and Engineering'),
  ('ME',  'OEC-812', 'Introduction to Weather Forecasting'),
  ('ME',  'OEC-815', 'Biomedical Equipments'),
  ('ME',  'OEC-820', 'Introduction to Python Programming')
) as s(dept_code, code, name)
join departments d on d.code = s.dept_code;

-- ============================================
-- 4. MOOC ↔ SUBJECT MAPPINGS (which MOOC exempts which subject, per department)
-- ============================================
insert into mooc_mappings (mooc_course_id, curriculum_subject_id, min_score, elite_required, is_active)
select mc.id, cs.id, 40, 'none', true
from (values
  -- Biomedical Engineering
  ('NPTEL-CE117', 'BE',  'OEC-806'),
  ('NPTEL-CE160', 'BE',  'OEC-812'),
  ('NPTEL-CS136', 'BE',  'OEC-820'),
  -- Computer Science and Engineering
  ('NPTEL-CS158', 'CSE', 'CS-802'),
  ('NPTEL-CS184', 'CSE', 'CS-803'),
  ('NPTEL-CE117', 'CSE', 'OEC-806'),
  ('NPTEL-CE160', 'CSE', 'OEC-812'),
  ('NPTEL-BM669', 'CSE', 'OEC-815'),
  -- Electrical and Electronics Engineering
  ('NPTEL-EE134', 'EEE', 'EEE-801'),
  ('NPTEL-EE170', 'EEE', 'EEE-802'),
  ('NPTEL-EE137', 'EEE', 'EEE-804'),
  ('NPTEL-CE117', 'EEE', 'OEC-806'),
  ('NPTEL-CE160', 'EEE', 'OEC-812'),
  ('NPTEL-BM669', 'EEE', 'OEC-815'),
  ('NPTEL-CS136', 'EEE', 'OEC-820'),
  -- Mechanical Engineering
  ('NPTEL-AE21',  'ME',  'ME-801'),
  ('NPTEL-CE117', 'ME',  'OEC-806'),
  ('NPTEL-CE160', 'ME',  'OEC-812'),
  ('NPTEL-BM669', 'ME',  'OEC-815'),
  ('NPTEL-CS136', 'ME',  'OEC-820')
) as m(mooc_code, dept_code, subj_code)
join mooc_courses mc on mc.code = m.mooc_code
join departments d on d.code = m.dept_code
join curriculum_subjects cs on cs.department_id = d.id and cs.code = m.subj_code;

commit;
