import { createClient } from '@/lib/supabase/server'
import { RegistrationsClient } from '@/components/dashboard/registrations-client'

export default async function RegistrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      *,
      mooc_course:mooc_courses(*),
      curriculum_subject:curriculum_subjects(*),
      exam_cycle:exam_cycles(*),
      result:results(*)
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  return <RegistrationsClient registrations={registrations || []} />
}
