import { createClient } from '@/lib/supabase/server'
import { CoursesClient } from '@/components/dashboard/courses-client'
import { redirect } from 'next/navigation'

export default async function CoursesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('department_id')
    .eq('id', user.id)
    .single()

  const [
    { data: courses },
    { data: examCycles },
    { data: mappings },
  ] = await Promise.all([
    supabase
      .from('mooc_courses')
      .select('*')
      .eq('is_active', true)
      .order('title'),
    supabase
      .from('exam_cycles')
      .select('*')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('mooc_mappings')
      .select('*, mooc_course:mooc_courses(*), curriculum_subject:curriculum_subjects(*, department:departments(*))')
      .eq('is_active', true),
  ])

  // Filter mappings to only those relevant to student's department
  const deptMappings = mappings?.filter(m => 
    m.curriculum_subject?.department_id === profile?.department_id
  ) || []

  // Get unique course IDs from relevant mappings
  const relevantCourseIds = new Set(deptMappings.map(m => m.mooc_course_id))
  
  // Filter courses to only those with relevant mappings
  const departmentCourses = courses?.filter(c => relevantCourseIds.has(c.id)) || []

  return (
    <CoursesClient
      courses={departmentCourses}
      examCycles={examCycles || []}
      mappings={deptMappings}
      departmentId={profile?.department_id}
    />
  )
}
