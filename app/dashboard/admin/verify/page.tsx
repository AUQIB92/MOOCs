import { createClient } from '@/lib/supabase/server'
import { VerifyResultsClient } from '@/components/dashboard/admin/verify-results-client'

export default async function VerifyResultsPage() {
  const supabase = await createClient()

  const { data: results } = await supabase
    .from('results')
    .select(`
      *,
      registration:registrations(
        *,
        student:profiles(*),
        mooc_course:mooc_courses(*),
        curriculum_subject:curriculum_subjects(*),
        exam_cycle:exam_cycles(*)
      )
    `)
    .order('created_at', { ascending: false })

  return <VerifyResultsClient results={results || []} />
}
