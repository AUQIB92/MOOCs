import { createClient } from '@/lib/supabase/server'
import { DepartmentsClient } from '@/components/dashboard/admin/departments-client'

export default async function DepartmentsPage() {
  const supabase = await createClient()

  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  return <DepartmentsClient departments={departments || []} />
}
