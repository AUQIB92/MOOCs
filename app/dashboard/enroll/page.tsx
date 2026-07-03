import { createClient } from '@/lib/supabase/server'
import { EnrollClient } from '@/components/dashboard/enroll-client'
import { redirect } from 'next/navigation'

export default async function EnrollPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('department_id')
    .eq('id', user.id)
    .single()

  const [
    { data: mappings },
    { data: examCycles },
  ] = await Promise.all([
    supabase
      .from('mooc_mappings')
      .select('*, mooc_course:mooc_courses(*), curriculum_subject:curriculum_subjects(*, department:departments(*))')
      .eq('is_active', true)
      .eq('curriculum_subjects.department_id', profile?.department_id),
    supabase
      .from('exam_cycles')
      .select('*')
      .eq('is_active', true)
      .order('name'),
  ])

  return (
    <EnrollClient
      mappings={mappings || []}
      examCycles={examCycles || []}
      departmentId={profile?.department_id}
    />
  )
}
