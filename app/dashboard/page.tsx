import { createClient } from '@/lib/supabase/server'
import { StudentDashboard } from '@/components/dashboard/student-dashboard'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, department:departments(*)')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Profile fetch error:', error.message, error.details)
  }

  if (!profile) {
    redirect('/auth/login')
  }

  if (profile.role === 'student') {
    return <StudentDashboard profile={profile} />
  }

  return <AdminDashboard profile={profile} />
}
