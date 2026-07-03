'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  ClipboardList,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  Building2,
} from '@/components/icons'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { format, parseISO, startOfMonth, getMonth, getYear } from 'date-fns'

interface AnalyticsClientProps {
  stats: {
    totalStudents: number
    totalRegistrations: number
    pendingRegistrations: number
    approvedRegistrations: number
    totalResults: number
    verifiedResults: number
    pendingResults: number
  }
  registrationsByMonth: { created_at: string }[]
  courseStats: { id: string; title: string; registrations: { count: number }[] }[]
  departmentStats: { id: string; name: string; profiles: { count: number }[] }[]
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

export function AnalyticsClient({ stats, registrationsByMonth, courseStats, departmentStats }: AnalyticsClientProps) {
  // Process registration data by month
  const monthlyData = registrationsByMonth.reduce((acc, reg) => {
    const date = parseISO(reg.created_at)
    const monthKey = format(date, 'MMM yyyy')
    acc[monthKey] = (acc[monthKey] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(monthlyData)
    .slice(-6)
    .map(([month, count]) => ({ month, registrations: count }))

  // Process course stats
  const topCourses = courseStats
    .map(course => ({
      name: course.title.length > 25 ? course.title.substring(0, 25) + '...' : course.title,
      value: course.registrations?.[0]?.count || 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  // Process department stats
  const departmentData = departmentStats
    .map(dept => ({
      name: dept.name,
      students: dept.profiles?.[0]?.count || 0,
    }))
    .filter(d => d.students > 0)
    .sort((a, b) => b.students - a.students)

  // Registration status distribution
  const statusData = [
    { name: 'Approved', value: stats.approvedRegistrations, color: 'hsl(var(--accent))' },
    { name: 'Pending', value: stats.pendingRegistrations, color: 'hsl(var(--warning))' },
    { name: 'Other', value: stats.totalRegistrations - stats.approvedRegistrations - stats.pendingRegistrations, color: 'hsl(var(--muted))' },
  ].filter(d => d.value > 0)

  const verificationRate = stats.totalResults > 0 
    ? Math.round((stats.verifiedResults / stats.totalResults) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of MOOC registrations, results, and platform metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Registered on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRegistrations}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="bg-warning/10 text-warning text-xs">
                {stats.pendingRegistrations} pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified Results</CardTitle>
            <CheckCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.verifiedResults}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                {stats.pendingResults} pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verification Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{verificationRate}%</div>
            <p className="text-xs text-muted-foreground">Of submitted results</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Registrations Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Registrations Over Time</CardTitle>
            <CardDescription>Monthly registration trends</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="registrations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No registration data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Status</CardTitle>
            <CardDescription>Distribution of registration statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Top Courses
            </CardTitle>
            <CardDescription>Most registered courses</CardDescription>
          </CardHeader>
          <CardContent>
            {topCourses.length > 0 ? (
              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{course.name}</p>
                      <p className="text-sm text-muted-foreground">{course.value} registrations</p>
                    </div>
                    <div className="h-2 w-24 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${(course.value / (topCourses[0]?.value || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No course data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Students by Department
            </CardTitle>
            <CardDescription>Distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            {departmentData.length > 0 ? (
              <div className="space-y-4">
                {departmentData.slice(0, 5).map((dept, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{dept.name}</p>
                    </div>
                    <Badge variant="secondary">{dept.students} students</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No department data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
