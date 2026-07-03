import { createClient } from '@/lib/supabase/server'
import { SubjectsClient } from '@/components/dashboard/admin/subjects-client'

export default async function SubjectsPage() {
  const supabase = await createClient()

  const [
    { data: subjects },
    { data: departments },
  ] = await Promise.all([
    supabase
      .from('curriculum_subjects')
      .select('*, department:departments(*)')
      .order('name'),
    supabase
      .from('departments')
      .select('*')
      .order('name'),
  ])

  return (
    <SubjectsClient
      subjects={subjects || []}
      departments={departments || []}
    />
  )
}
