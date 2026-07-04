'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  ClipboardList,
  BookOpen,
  UserCheck,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from '@/components/icons'
import type { Profile, Registration, DashboardStats } from '@/lib/types'

interface AdminDashboardProps {
  profile: Profile
}

export function AdminDashboard({ profile }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingRegistrations, setPendingRegistrations] = useState<Registration[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // Fetch counts
      const [
        { count: studentCount },
        { count: registrationCount },
        { count: pendingVerifyCount },
        { count: completedCount },
        { count: courseCount },
        { count: cycleCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('registrations').select('*', { count: 'exact', head: true }),
        supabase.from('results').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('results').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
        supabase.from('mooc_courses').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('exam_cycles').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ])

      setStats({
        totalStudents: studentCount || 0,
        totalRegistrations: registrationCount || 0,
        pendingVerifications: pendingVerifyCount || 0,
        completedCourses: completedCount || 0,
        totalCourses: courseCount || 0,
        activeExamCycles: cycleCount || 0,
      })

      // Fetch pending registrations
      const { data: pending } = await supabase
        .from('registrations')
        .select('*, student:profiles(*), mooc_course:mooc_courses(*), curriculum_subject:curriculum_subjects(*)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5)

      if (pending) {
        setPendingRegistrations(pending as Registration[])
      }

      // Fetch pending verifications
      const { data: verify } = await supabase
        .from('results')
        .select('*, registration:registrations(*, student:profiles(*), mooc_course:mooc_courses(*))')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5)

      if (verify) {
        setPendingVerifications(verify.map(v => v.registration) as Registration[])
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const isAdmin = profile.role === 'admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isAdmin ? 'Admin' : 'Faculty'} Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of MOOC registrations and verifications
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/admin/registrations" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto">View All Registrations</Button>
          </Link>
          <Link href="/dashboard/admin/verify" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto">Verify Results</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">Registered on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalRegistrations || 0}</div>
            <p className="text-xs text-muted-foreground">MOOC course registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verifications</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats?.pendingVerifications || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting result verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified Results</CardTitle>
            <CheckCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats?.completedCourses || 0}</div>
            <p className="text-xs text-muted-foreground">Credits transferred</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Admin */}
      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/admin/cycles">
            <Card className="cursor-pointer transition-colors hover:border-primary/50">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Exam Cycles</CardTitle>
                  <CardDescription>{stats?.activeExamCycles} active</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/admin/courses">
            <Card className="cursor-pointer transition-colors hover:border-primary/50">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">MOOC Courses</CardTitle>
                  <CardDescription>{stats?.totalCourses} courses</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/admin/users">
            <Card className="cursor-pointer transition-colors hover:border-primary/50">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Manage Users</CardTitle>
                  <CardDescription>{stats?.totalStudents} users</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/admin/analytics">
            <Card className="cursor-pointer transition-colors hover:border-primary/50">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Analytics</CardTitle>
                  <CardDescription>View reports</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      )}

      {/* Pending Items */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Registrations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Registrations</CardTitle>
              <CardDescription>New registration requests awaiting approval</CardDescription>
            </div>
            <Link href="/dashboard/admin/registrations?status=pending">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingRegistrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="mb-2 h-10 w-10 text-accent/50" />
                <p className="text-muted-foreground">No pending registrations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{reg.student?.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {reg.mooc_course?.title}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-4 shrink-0 bg-warning/10 text-warning border-warning/20">
                      <Clock className="mr-1 h-3 w-3" />
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Verifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>Results awaiting verification</CardDescription>
            </div>
            <Link href="/dashboard/admin/verify">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingVerifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="mb-2 h-10 w-10 text-accent/50" />
                <p className="text-muted-foreground">No pending verifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingVerifications.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{reg.student?.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {reg.mooc_course?.title}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-4 shrink-0 bg-primary/10 text-primary border-primary/20">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Verify
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
