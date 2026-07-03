import { createClient } from '@/lib/supabase/server'
import { ResultsClient } from '@/components/dashboard/results-client'

export default async function ResultsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get approved registrations without results
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
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  // Filter out registrations that already have results
  const eligibleRegistrations = registrations?.filter(r => !r.result) || []

  return <ResultsClient registrations={eligibleRegistrations} />
}
