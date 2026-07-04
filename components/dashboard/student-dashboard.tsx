'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard, StatCardSkeleton } from '@/components/dashboard/stat-card'
import {
  BookOpen,
  ClipboardList,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Upload,
  Calendar,
  ExternalLink,
  AlertCircle,
  Eye,
} from '@/components/icons'
import type { Profile, Registration, ExamCycle, StudentStats } from '@/lib/types'

interface StudentDashboardProps {
  profile: Profile
}

export function StudentDashboard({ profile }: StudentDashboardProps) {
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([])
  const [activeExamCycle, setActiveExamCycle] = useState<ExamCycle | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // Fetch student stats
      const { data: registrations } = await supabase
        .from('registrations')
        .select('*, result:results(*)')
        .eq('student_id', profile.id)

      if (registrations) {
        const totalRegistrations = registrations.length
        const pendingRegistrations = registrations.filter(r => r.status === 'pending').length
        const completedCourses = registrations.filter(r => r.result?.status === 'verified').length
        const verifiedResults = registrations.filter(r => r.result?.curriculum_replaced).length
        const totalCredits = registrations
          .filter(r => r.result?.curriculum_replaced)
          .reduce((acc, r) => acc + 3, 0)

        setStats({
          totalRegistrations,
          pendingRegistrations,
          completedCourses,
          verifiedResults,
          totalCredits,
        })
      }

      // Fetch recent registrations
      const { data: recent } = await supabase
        .from('registrations')
        .select('*, mooc_course:mooc_courses(*), curriculum_subject:curriculum_subjects(*), exam_cycle:exam_cycles(*), result:results(*)')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recent) {
        setRecentRegistrations(recent as Registration[])
      }

      // Fetch active exam cycle
      const { data: cycle } = await supabase
        .from('exam_cycles')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false })
        .limit(1)
        .single()

      if (cycle) {
        setActiveExamCycle(cycle)
      }

      setLoading(false)
    }

    fetchData()
  }, [profile.id, supabase])

  const getStatusBadge = (status: string, hasResult?: boolean) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30"><Clock className="mr-1 h-3 w-3" />Pending</Badge>
      case 'approved':
        if (hasResult) {
          return <Badge variant="outline" className="bg-success/10 text-success border-success/30"><CheckCircle className="mr-1 h-3 w-3" />Verified</Badge>
        }
        return <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30"><CheckCircle className="mr-1 h-3 w-3" />Recorded</Badge>
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const isUploadWindowOpen = activeExamCycle?.result_upload_enabled && 
    activeExamCycle?.result_upload_start && 
    activeExamCycle?.result_upload_end &&
    new Date() >= new Date(activeExamCycle.result_upload_start) &&
    new Date() <= new Date(activeExamCycle.result_upload_end)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-56 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl lg:col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 md:p-8">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/5 blur-3xl" />
        
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Welcome back, {profile.full_name}!</h2>
            <p className="mt-1 text-muted-foreground">
              {profile.department?.name || 'N/A'} | {profile.enrollment_number || 'N/A'}
            </p>
          </div>
          {activeExamCycle && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-card/80 px-4 py-3 backdrop-blur-sm">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{activeExamCycle.name}</p>
                  <p className="text-xs text-muted-foreground">Current Cycle</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Window Alert */}
      {isUploadWindowOpen && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <Upload className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-success">Result Upload Window Open!</h3>
              <p className="text-sm text-muted-foreground">
                Upload your NPTEL certificates before {new Date(activeExamCycle!.result_upload_end!).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Link href="/dashboard/results">
              <Button className="gap-2 bg-success hover:bg-success/90">
                Upload Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Registrations"
          value={stats?.totalRegistrations || 0}
          hint="Across all exam cycles"
          icon={ClipboardList}
          tone="primary"
        />
        <StatCard
          label="Pending Review"
          value={stats?.pendingRegistrations || 0}
          hint="Awaiting admin approval"
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Verified Results"
          value={stats?.verifiedResults || 0}
          hint="Credits transferred"
          icon={Award}
          tone="success"
        />
        <StatCard
          label="Total Credits"
          value={stats?.totalCredits || 0}
          hint="From MOOC courses"
          icon={TrendingUp}
          tone="accent"
        />
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            Your MOOC Journey
          </CardTitle>
          <CardDescription>Complete all steps to earn curriculum credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { 
                step: 1, 
                title: 'Enroll Externally', 
                description: 'Register on NPTEL/SWAYAM',
                icon: BookOpen,
                complete: (stats?.totalRegistrations || 0) > 0,
                href: '/dashboard/courses'
              },
              { 
                step: 2, 
                title: 'Record Enrollment', 
                description: 'Upload proof of enrollment',
                icon: FileText,
                complete: recentRegistrations.some(r => r.status === 'approved'),
                href: '/dashboard/enroll'
              },
              { 
                step: 3, 
                title: 'Complete Course', 
                description: 'Study on NPTEL and pass exam',
                icon: Award,
                complete: false,
                href: 'https://nptel.ac.in',
                external: true
              },
              { 
                step: 4, 
                title: 'Upload Certificate', 
                description: 'Submit for verification',
                icon: Upload,
                complete: (stats?.verifiedResults || 0) > 0,
                href: '/dashboard/results'
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {index < 3 && (
                  <div className="absolute -right-2 top-8 hidden h-0.5 w-4 bg-border lg:block" />
                )}
                <Link href={item.href} target={item.external ? '_blank' : undefined}>
                  <Card className={`group h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md ${item.complete ? 'border-success/30 bg-success/5' : ''}`}>
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.complete ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'} transition-colors group-hover:bg-primary/10 group-hover:text-primary`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className="text-2xl font-bold text-muted-foreground/30">0{item.step}</span>
                      </div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      {item.external && (
                        <ExternalLink className="mt-2 h-3 w-3 text-muted-foreground" />
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/courses">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Browse Courses</p>
                  <p className="text-xs text-muted-foreground">View approved MOOCs</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <Link href="/dashboard/enroll">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <FileText className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Record Enrollment</p>
                  <p className="text-xs text-muted-foreground">Upload proof</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <Link href="/dashboard/results">
              <Button variant={isUploadWindowOpen ? "default" : "outline"} className={`w-full justify-start gap-3 h-12 text-left ${isUploadWindowOpen ? 'bg-success hover:bg-success/90' : ''}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isUploadWindowOpen ? 'bg-white/20' : 'bg-success/10'}`}>
                  <Upload className={`h-4 w-4 ${isUploadWindowOpen ? 'text-white' : 'text-success'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Upload Results</p>
                  <p className={`text-xs ${isUploadWindowOpen ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {isUploadWindowOpen ? 'Window open!' : 'Submit certificates'}
                  </p>
                </div>
                <ArrowRight className={`h-4 w-4 ${isUploadWindowOpen ? 'text-white/80' : 'text-muted-foreground'}`} />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Enrollments</CardTitle>
              <CardDescription>Your latest recorded MOOC enrollments</CardDescription>
            </div>
            <Link href="/dashboard/registrations">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentRegistrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-1 font-semibold">No enrollments recorded</h3>
                <p className="mb-4 text-sm text-muted-foreground">Enroll on NPTEL, then record your enrollment here</p>
                <Link href="/dashboard/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="group flex items-center gap-4 rounded-xl border border-border p-4 transition-all hover:border-primary/30 hover:bg-muted/30"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{reg.mooc_course?.title || 'Unknown Course'}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        Replaces: {reg.curriculum_subject?.name || 'N/A'} | {reg.exam_cycle?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {reg.registration_proof_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={reg.registration_proof_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {getStatusBadge(reg.status, reg.result?.status === 'verified')}
                    </div>
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
