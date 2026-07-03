import { createClient } from '@/lib/supabase/server'
import { AnalyticsClient } from '@/components/dashboard/admin/analytics-client'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Fetch all the data needed for analytics
  const [
    { count: totalStudents },
    { count: totalRegistrations },
    { count: pendingRegistrations },
    { count: approvedRegistrations },
    { count: totalResults },
    { count: verifiedResults },
    { count: pendingResults },
    { data: registrationsByMonth },
    { data: courseStats },
    { data: departmentStats },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('registrations').select('*', { count: 'exact', head: true }),
    supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('results').select('*', { count: 'exact', head: true }),
    supabase.from('results').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
    supabase.from('results').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('registrations').select('created_at'),
    supabase.from('mooc_courses').select('id, title, registrations:registrations(count)'),
    supabase.from('departments').select('id, name, profiles:profiles(count)'),
  ])

  const stats = {
    totalStudents: totalStudents || 0,
    totalRegistrations: totalRegistrations || 0,
    pendingRegistrations: pendingRegistrations || 0,
    approvedRegistrations: approvedRegistrations || 0,
    totalResults: totalResults || 0,
    verifiedResults: verifiedResults || 0,
    pendingResults: pendingResults || 0,
  }

  return (
    <AnalyticsClient 
      stats={stats}
      registrationsByMonth={registrationsByMonth || []}
      courseStats={courseStats || []}
      departmentStats={departmentStats || []}
    />
  )
}
