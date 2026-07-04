import { createClient } from '@/lib/supabase/server'
import { AdminRegistrationsClient } from '@/components/dashboard/admin/registrations-client'

export default async function AdminRegistrationsPage() {
  const supabase = await createClient()

  const [{ data: registrations }, { data: hods }] = await Promise.all([
    supabase
      .from('registrations')
      .select(`
        *,
        student:profiles(*, department:departments(*)),
        mooc_course:mooc_courses(*),
        curriculum_subject:curriculum_subjects(*),
        exam_cycle:exam_cycles(*),
        result:results(*)
      `)
      .order('created_at', { ascending: false }),
    // Departments that currently have a HoD — used to flag pending enrollments
    // that can't be routed to anyone yet. (Errors/empty if migrations aren't
    // applied; the screen degrades gracefully.)
    supabase.from('profiles').select('department_id').eq('role', 'hod'),
  ])

  const hodDepartmentIds = Array.from(
    new Set((hods ?? []).map((h) => h.department_id).filter((id): id is string => Boolean(id)))
  )

  return (
    <AdminRegistrationsClient
      registrations={registrations || []}
      hodDepartmentIds={hodDepartmentIds}
    />
  )
}
