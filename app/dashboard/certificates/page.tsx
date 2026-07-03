import { createClient } from '@/lib/supabase/server'
import { CertificatesClient } from '@/components/dashboard/certificates-client'

export default async function CertificatesPage() {
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

  const withResults = (registrations || []).filter((r) => r.result)

  return <CertificatesClient registrations={withResults} />
}
