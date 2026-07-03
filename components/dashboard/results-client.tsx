'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  FileText,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  ClipboardList,
} from '@/components/icons'
import { toast } from 'sonner'
import type { Registration, EliteStatus } from '@/lib/types'

interface ResultsClientProps {
  registrations: Registration[]
}

export function ResultsClient({ registrations }: ResultsClientProps) {
  const searchParams = useSearchParams()
  const preselectedId = searchParams.get('registration')
  
  const [selectedRegistration, setSelectedRegistration] = useState<string>(preselectedId || '')
  const [score, setScore] = useState<string>('')
  const [eliteStatus, setEliteStatus] = useState<EliteStatus>('none')
  const [certificateUrl, setCertificateUrl] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const selectedReg = registrations.find(r => r.id === selectedRegistration)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRegistration || !score) {
      toast.error('Please fill in all required fields')
      return
    }

    const scoreNum = parseInt(score)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      toast.error('Please enter a valid score between 0 and 100')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.from('results').insert({
      registration_id: selectedRegistration,
      score: scoreNum,
      elite_status: eliteStatus,
      certificate_url: certificateUrl || null,
      status: 'pending',
    })

    if (error) {
      toast.error('Failed to submit result: ' + error.message)
      setIsSubmitting(false)
      return
    }

    toast.success('Result submitted successfully! Awaiting verification.')
    router.push('/dashboard/registrations')
    router.refresh()
  }

  if (registrations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Upload Results</h2>
          <p className="text-muted-foreground">
            Submit your MOOC course results for verification
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">No eligible registrations</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              You need to have approved registrations without uploaded results to submit here. 
              Check your registrations or register for a new course.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload Results</h2>
        <p className="text-muted-foreground">
          Submit your MOOC course results for verification
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Result Submission</CardTitle>
            <CardDescription>
              Fill in your course completion details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Registration Selection */}
              <div className="space-y-2">
                <Label htmlFor="registration">Select Registration *</Label>
                <Select value={selectedRegistration} onValueChange={setSelectedRegistration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a registration" />
                  </SelectTrigger>
                  <SelectContent>
                    {registrations.map((reg) => (
                      <SelectItem key={reg.id} value={reg.id}>
                        {reg.mooc_course?.title} - {reg.exam_cycle?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Score */}
              <div className="space-y-2">
                <Label htmlFor="score">Final Score (%) *</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter your score (0-100)"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  required
                />
              </div>

              {/* Elite Status */}
              <div className="space-y-3">
                <Label>Elite Status</Label>
                <RadioGroup
                  value={eliteStatus}
                  onValueChange={(v) => setEliteStatus(v as EliteStatus)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="elite-none" />
                    <Label htmlFor="elite-none" className="font-normal">None</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="silver" id="elite-silver" />
                    <Label htmlFor="elite-silver" className="font-normal">Silver</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gold" id="elite-gold" />
                    <Label htmlFor="elite-gold" className="font-normal">Gold</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Certificate URL */}
              <div className="space-y-2">
                <Label htmlFor="certificateUrl">Certificate URL</Label>
                <Input
                  id="certificateUrl"
                  type="url"
                  placeholder="https://nptel.ac.in/certificate/..."
                  value={certificateUrl}
                  onChange={(e) => setCertificateUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Paste the public URL of your NPTEL/SWAYAM certificate
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Result
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="space-y-6">
          {selectedReg && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Course</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{selectedReg.mooc_course?.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedReg.mooc_course?.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Replaces</p>
                  <p className="font-medium">{selectedReg.curriculum_subject?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedReg.curriculum_subject?.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Exam Cycle</p>
                  <p className="font-medium">{selectedReg.exam_cycle?.name}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p>Your result will be verified by the faculty coordinator before credit transfer.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p>Make sure the certificate URL is publicly accessible for verification.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p>Elite status (if any) should match your certificate.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p>Minimum passing score for credit transfer is typically 40%.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
