import { createClient } from '@/lib/supabase/server'
import { UsersClient } from '@/components/dashboard/admin/users-client'

export default async function UsersPage() {
  const supabase = await createClient()

  const [{ data: profiles }, { data: departments }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*, department:departments(*)')
      .order('created_at', { ascending: false }),
    supabase
      .from('departments')
      .select('*')
      .order('name'),
  ])

  return (
    <UsersClient
      profiles={profiles || []}
      departments={departments || []}
    />
  )
}
