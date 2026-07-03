import { createClient } from '@/lib/supabase/server'
import { ManageCoursesClient } from '@/components/dashboard/admin/manage-courses-client'

export default async function ManageCoursesPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('mooc_courses')
    .select('*')
    .order('title')

  return <ManageCoursesClient courses={courses || []} />
}
