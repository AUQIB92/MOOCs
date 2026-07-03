import { createClient } from '@/lib/supabase/server'
import { MappingsClient } from '@/components/dashboard/admin/mappings-client'

export default async function MappingsPage() {
  const supabase = await createClient()

  const [
    { data: mappings },
    { data: courses },
    { data: subjects },
    { data: departments },
  ] = await Promise.all([
    supabase
      .from('mooc_mappings')
      .select('*, mooc_course:mooc_courses(*), curriculum_subject:curriculum_subjects(*, department:departments(*))')
      .order('created_at', { ascending: false }),
    supabase
      .from('mooc_courses')
      .select('*')
      .eq('is_active', true)
      .order('title'),
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
    <MappingsClient
      mappings={mappings || []}
      courses={courses || []}
      subjects={subjects || []}
      departments={departments || []}
    />
  )
}
