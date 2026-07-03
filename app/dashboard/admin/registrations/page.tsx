import { createClient } from '@/lib/supabase/server'
import { AdminRegistrationsClient } from '@/components/dashboard/admin/registrations-client'

export default async function AdminRegistrationsPage() {
  const supabase = await createClient()

  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      *,
      student:profiles(*),
      mooc_course:mooc_courses(*),
      curriculum_subject:curriculum_subjects(*),
      exam_cycle:exam_cycles(*),
      result:results(*)
    `)
    .order('created_at', { ascending: false })

  return <AdminRegistrationsClient registrations={registrations || []} />
}
