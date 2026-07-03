import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar, DashboardHeader } from '@/components/dashboard/sidebar'
import { AuthProvider } from '@/lib/auth-context'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="pl-[70px] md:pl-[260px]">
          <DashboardHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}
