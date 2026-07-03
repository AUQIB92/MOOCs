'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BookOpen,
  Search,
  Filter,
  ExternalLink,
  Clock,
  RefreshCw,
  AlertTriangle,
} from '@/components/icons'
import type { MoocCourse, ExamCycle, MoocMapping } from '@/lib/types'

interface CoursesClientProps {
  courses: MoocCourse[]
  examCycles: ExamCycle[]
  mappings: MoocMapping[]
  departmentId?: string | null
}

export function CoursesClient({ courses, examCycles, mappings, departmentId }: CoursesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const router = useRouter()

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProvider = providerFilter === 'all' || course.provider === providerFilter
    return matchesSearch && matchesProvider
  })

  const providers = [...new Set(courses.map((c) => c.provider))]

  const getCourseMapping = (courseId: string) => {
    return mappings.filter((m) => m.mooc_course_id === courseId)
  }

  const handleEnrollClick = (course: MoocCourse) => {
    if (course.external_url) {
      window.open(course.external_url, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Approved MOOC Courses</h2>
          <p className="text-muted-foreground">
            Browse approved courses and enroll externally on NPTEL/SWAYAM
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.refresh()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Department Warning */}
      {!departmentId && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4 text-warning">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">No department assigned to your profile</p>
            <p className="text-sm text-warning/80">
              Contact admin to assign a department. Showing all available courses for now.
            </p>
          </div>
        </div>
      )}

      {departmentId && (
        <Badge variant="outline" className="w-fit">
          Courses for your department
        </Badge>
      )}

      {/* Steps Guide */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</div>
              <div>
                <p className="text-sm font-medium">Enroll Externally</p>
                <p className="text-xs text-muted-foreground">Go to NPTEL/SWAYAM and register</p>
              </div>
            </div>
            <div className="hidden sm:block text-muted-foreground">→</div>
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</div>
              <div>
                <p className="text-sm font-medium">Record Enrollment</p>
                <p className="text-xs text-muted-foreground">Upload proof in Record tab</p>
              </div>
            </div>
            <div className="hidden sm:block text-muted-foreground">→</div>
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</div>
              <div>
                <p className="text-sm font-medium">Get Approved</p>
                <p className="text-xs text-muted-foreground">Admin verifies your enrollment</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            {departmentId ? 'No MOOCs mapped to your department' : 'No courses available'}
          </p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {departmentId 
              ? 'Admin must link MOOC courses to your department\'s curriculum subjects'
              : 'No courses have been added yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const courseMappings = getCourseMapping(course.id)
            return (
              <Card key={course.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="shrink-0">
                      {course.provider}
                    </Badge>
                    <Badge variant="outline" className="shrink-0">
                      {course.credits} Credits
                    </Badge>
                  </div>
                  <CardTitle className="mt-2 line-clamp-2 text-lg">{course.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration_weeks} weeks
                    </span>
                    <span className="font-mono text-xs">{course.code}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {course.description && (
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {course.description}
                    </p>
                  )}
                  {courseMappings.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Replaces:</p>
                      <div className="flex flex-wrap gap-1">
                        {courseMappings.slice(0, 2).map((m) => (
                          <Badge key={m.id} variant="outline" className="text-xs">
                            {m.curriculum_subject?.code}
                          </Badge>
                        ))}
                        {courseMappings.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{courseMappings.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {course.external_url && (
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => handleEnrollClick(course)}>
                      <ExternalLink className="h-4 w-4" />
                      Enroll on {course.provider}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
