// Database types for MOOC Management Platform

export type UserRole = 'student' | 'faculty_coordinator' | 'admin'
export type RegistrationStatus = 'pending' | 'approved' | 'rejected'
export type ResultStatus = 'pending' | 'verified' | 'rejected'
export type EliteStatus = 'none' | 'silver' | 'gold'

export interface Department {
  id: string
  name: string
  code: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  department_id: string | null
  enrollment_number: string | null
  semester: number | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  department?: Department
}

export interface MoocCourse {
  id: string
  title: string
  code: string
  provider: string
  credits: number
  duration_weeks: number
  description: string | null
  syllabus: string | null
  external_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CurriculumSubject {
  id: string
  name: string
  code: string
  credits: number
  semester: number
  department_id: string | null
  subject_type: string
  is_replaceable: boolean
  created_at: string
  department?: Department
}

export interface MoocMapping {
  id: string
  mooc_course_id: string
  curriculum_subject_id: string
  min_score: number
  elite_required: EliteStatus
  is_active: boolean
  created_at: string
  mooc_course?: MoocCourse
  curriculum_subject?: CurriculumSubject
}

export interface ExamCycle {
  id: string
  name: string
  start_date: string
  end_date: string
  registration_deadline: string | null
  result_upload_enabled: boolean
  result_upload_start: string | null
  result_upload_end: string | null
  is_active: boolean
  created_at: string
}

export interface Registration {
  id: string
  student_id: string
  mooc_course_id: string
  curriculum_subject_id: string
  exam_cycle_id: string
  registration_proof_url: string | null
  status: RegistrationStatus
  admin_remarks: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  student?: Profile
  mooc_course?: MoocCourse
  curriculum_subject?: CurriculumSubject
  exam_cycle?: ExamCycle
  result?: Result
}

export interface Result {
  id: string
  registration_id: string
  score: number
  elite_status: EliteStatus
  certificate_url: string | null
  result_pdf_url: string | null
  status: ResultStatus
  verified_by: string | null
  verified_at: string | null
  admin_remarks: string | null
  curriculum_replaced: boolean
  created_at: string
  updated_at: string
  registration?: Registration
  verifier?: Profile
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  table_name: string
  record_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
  user?: Profile
}

// Dashboard stats types
export interface DashboardStats {
  totalStudents: number
  totalRegistrations: number
  pendingVerifications: number
  completedCourses: number
  totalCourses: number
  activeExamCycles: number
}

export interface StudentStats {
  totalRegistrations: number
  pendingRegistrations: number
  completedCourses: number
  verifiedResults: number
  totalCredits: number
}
