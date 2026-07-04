'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/dashboard/page-header'
import {
  BookOpen,
  Search,
  Filter,
  Upload,
  Loader2,
  Calendar,
  CheckCircle,
  RefreshCw,
} from '@/components/icons'
import { toast } from 'sonner'
import type { ExamCycle, MoocMapping } from '@/lib/types'

interface EnrollClientProps {
  mappings: MoocMapping[]
  examCycles: ExamCycle[]
  departmentId?: string | null
}

export function EnrollClient({ mappings, examCycles, departmentId }: EnrollClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [selectedMapping, setSelectedMapping] = useState<MoocMapping | null>(null)
  const [selectedCycle, setSelectedCycle] = useState<string>('')
  const [registrationProof, setRegistrationProof] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enrollmentUrl, setEnrollmentUrl] = useState('')
  
  const { profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const providers = [
    ...new Set(mappings.map((m) => m.mooc_course?.provider).filter((p): p is string => Boolean(p))),
  ]

  const filteredMappings = mappings.filter((m) => {
    const course = m.mooc_course
    if (!course) return false
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProvider = providerFilter === 'all' || course.provider === providerFilter
    return matchesSearch && matchesProvider
  })

  const uploadProof = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${profile?.id}/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('registration-proofs')
      .upload(fileName, file)

    if (uploadError) {
      toast.error('Failed to upload proof: ' + uploadError.message)
      return null
    }

    const { data } = supabase.storage
      .from('registration-proofs')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  const handleSubmitEnrollment = async () => {
    if (!selectedMapping || !selectedCycle || !profile) {
      toast.error('Please select course and exam cycle')
      return
    }

    if (!registrationProof) {
      toast.error('Please upload your registration proof')
      return
    }

    setIsSubmitting(true)

    const proofUrl = await uploadProof(registrationProof)
    if (!proofUrl) {
      setIsSubmitting(false)
      return
    }

    // Enrollments don't require approval — they are recorded and active
    // immediately. (Verification happens later, at the results/certificate stage.)
    const { error } = await supabase.from('registrations').insert({
      student_id: profile.id,
      mooc_course_id: selectedMapping.mooc_course_id,
      curriculum_subject_id: selectedMapping.curriculum_subject_id,
      exam_cycle_id: selectedCycle,
      registration_proof_url: proofUrl,
      status: 'approved',
      approved_at: new Date().toISOString(),
    })

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already recorded this course for this exam cycle')
      } else {
        toast.error('Failed to record: ' + error.message)
      }
      setIsSubmitting(false)
      return
    }

    toast.success('Enrollment recorded successfully!')
    setSelectedMapping(null)
    setSelectedCycle('')
    setRegistrationProof(null)
    setEnrollmentUrl('')
    window.location.href = '/dashboard/registrations'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Record Enrollment"
        description="Record your NPTEL/SWAYAM enrollment — no approval needed, it's active right away"
        icon={Upload}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.refresh()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Courses
          </Button>
        }
      >
        {departmentId && (
          <Badge variant="outline" className="mt-2">
            Courses for your department
          </Badge>
        )}
      </PageHeader>

      {/* Steps Guide */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</div>
              <div>
                <p className="text-sm font-medium">Enroll on NPTEL/SWAYAM</p>
                <p className="text-xs text-muted-foreground">Register on the provider platform</p>
              </div>
            </div>
            <div className="hidden sm:block text-muted-foreground">→</div>
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</div>
              <div>
                <p className="text-sm font-medium">Take Screenshot</p>
                <p className="text-xs text-muted-foreground">Capture your enrollment confirmation</p>
              </div>
            </div>
            <div className="hidden sm:block text-muted-foreground">→</div>
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</div>
              <div>
                <p className="text-sm font-medium">Record Here</p>
                <p className="text-xs text-muted-foreground">Recorded instantly — no approval</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Course Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Course</CardTitle>
              <CardDescription>Choose the MOOC course you enrolled in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={providerFilter} onValueChange={setProviderFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {providers.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredMappings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen className="mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No courses found</p>
                  </div>
                ) : (
                  filteredMappings.map((mapping) => {
                    const course = mapping.mooc_course
                    const subject = mapping.curriculum_subject
                    const isSelected = selectedMapping?.id === mapping.id
                    return (
                      <button
                        key={mapping.id}
                        onClick={() => setSelectedMapping(mapping)}
                        className={`w-full text-left rounded-lg border p-3 transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{course?.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{course?.provider}</Badge>
                              <span className="text-xs text-muted-foreground">{course?.credits} credits</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Replaces: {subject?.name} ({subject?.code})
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Enrollment Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Details</CardTitle>
              <CardDescription>Fill in your enrollment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Course Info */}
              {selectedMapping ? (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <p className="font-medium text-sm">{selectedMapping.mooc_course?.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedMapping.mooc_course?.code} • {selectedMapping.mooc_course?.provider} • {selectedMapping.mooc_course?.credits} credits
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Replaces: {selectedMapping.curriculum_subject?.name}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  Select a course from the list
                </div>
              )}

              {/* Exam Cycle */}
              <div className="space-y-2">
                <Label>Exam Cycle</Label>
                <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                  <SelectTrigger>
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select exam cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {examCycles.map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id}>
                        {cycle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Enrollment URL (optional) */}
              <div className="space-y-2">
                <Label>Enrollment URL (optional)</Label>
                <Input
                  placeholder="https://nptel.ac.in/courses/..."
                  value={enrollmentUrl}
                  onChange={(e) => setEnrollmentUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Link to your course page on NPTEL/SWAYAM</p>
              </div>

              {/* Proof Upload */}
              <div className="space-y-2">
                <Label>Registration Proof *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setRegistrationProof(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                </div>
                {registrationProof && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {registrationProof.name}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground">Screenshot or PDF of enrollment confirmation</p>
              </div>

              {/* Requirements */}
              {selectedMapping && (
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
                  <p className="font-medium">Requirements:</p>
                  <ul className="mt-1 space-y-1 text-muted-foreground text-xs">
                    <li>• Min score: {selectedMapping.min_score}%</li>
                    <li>• Elite status: {selectedMapping.elite_required === 'none' ? 'Not required' : selectedMapping.elite_required}</li>
                  </ul>
                </div>
              )}

              {/* Submit */}
              <Button 
                className="w-full gap-2" 
                onClick={handleSubmitEnrollment}
                disabled={isSubmitting || !selectedMapping || !selectedCycle || !registrationProof}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Submit Enrollment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
