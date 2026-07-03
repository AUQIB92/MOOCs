-- 001_initial_schema.sql
-- MOOC Management Platform - Initial Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
create type user_role as enum ('student', 'faculty_coordinator', 'admin');
create type registration_status as enum ('pending', 'approved', 'rejected');
create type result_status as enum ('pending', 'verified', 'rejected');
create type elite_status as enum ('none', 'silver', 'gold');

-- ============================================
-- TABLES
-- ============================================

-- Departments
create table departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text not null unique,
  created_at timestamptz default now()
);

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role user_role not null default 'student',
  department_id uuid references departments(id) on delete set null,
  enrollment_number text,
  semester int,
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MOOC Courses
create table mooc_courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  code text not null unique,
  provider text not null,
  credits int not null default 0,
  duration_weeks int not null default 0,
  description text,
  syllabus text,
  external_url text,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Curriculum Subjects
create table curriculum_subjects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text not null,
  credits int not null default 0,
  semester int not null,
  department_id uuid references departments(id) on delete set null,
  subject_type text not null,
  is_replaceable boolean not null default false,
  created_at timestamptz default now(),
  unique(code, department_id)
);

-- MOOC to Curriculum Mappings
create table mooc_mappings (
  id uuid primary key default uuid_generate_v4(),
  mooc_course_id uuid not null references mooc_courses(id) on delete cascade,
  curriculum_subject_id uuid not null references curriculum_subjects(id) on delete cascade,
  min_score numeric not null default 0,
  elite_required elite_status not null default 'none',
  is_active boolean not null default true,
  created_at timestamptz default now(),
  unique(mooc_course_id, curriculum_subject_id)
);

-- Exam Cycles
create table exam_cycles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  start_date date not null,
  end_date date not null,
  registration_deadline timestamptz,
  result_upload_enabled boolean not null default false,
  result_upload_start timestamptz,
  result_upload_end timestamptz,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- Registrations
create table registrations (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  mooc_course_id uuid not null references mooc_courses(id) on delete cascade,
  curriculum_subject_id uuid not null references curriculum_subjects(id) on delete cascade,
  exam_cycle_id uuid not null references exam_cycles(id) on delete cascade,
  registration_proof_url text,
  status registration_status not null default 'pending',
  admin_remarks text,
  approved_by uuid references profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Results
create table results (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid not null unique references registrations(id) on delete cascade,
  score numeric not null,
  elite_status elite_status not null default 'none',
  certificate_url text,
  result_pdf_url text,
  status result_status not null default 'pending',
  verified_by uuid references profiles(id) on delete set null,
  verified_at timestamptz,
  admin_remarks text,
  curriculum_replaced boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Audit Logs
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now()
);
