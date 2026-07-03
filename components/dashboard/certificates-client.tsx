'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Award,
  Search,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
} from '@/components/icons'
import { format, parseISO } from 'date-fns'
import type { Registration, ResultStatus } from '@/lib/types'

interface CertificatesClientProps {
  registrations: Registration[]
}

const statusBadge: Record<ResultStatus, { label: string; className: string; icon: typeof CheckCircle }> = {
  verified: { label: 'Verified', className: 'bg-accent/10 text-accent border-accent/20', icon: CheckCircle },
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
}

export function CertificatesClient({ registrations }: CertificatesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = registrations.filter((r) =>
    (r.mooc_course?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.curriculum_subject?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Certificates</h2>
        <p className="text-muted-foreground">
          Certificates and results submitted for your MOOC course completions
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by course or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Award className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">No certificates yet</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Once you submit a result for an approved registration, it will show up here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((registration) => {
            const result = registration.result
            if (!result) return null
            const status = statusBadge[result.status]
            const StatusIcon = status.icon

            return (
              <Card key={registration.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{registration.mooc_course?.title}</CardTitle>
                      <CardDescription>{registration.mooc_course?.code} · {registration.exam_cycle?.name}</CardDescription>
                    </div>
                    <Badge variant="outline" className={status.className}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Replaces</p>
                      <p className="font-medium">{registration.curriculum_subject?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Score</p>
                      <p className="font-medium">{result.score}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Elite Status</p>
                      <p className="font-medium capitalize">{result.elite_status}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Verified On</p>
                      <p className="font-medium">
                        {result.verified_at ? format(parseISO(result.verified_at), 'MMM d, yyyy') : '—'}
                      </p>
                    </div>
                  </div>

                  {result.admin_remarks && (
                    <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">
                      {result.admin_remarks}
                    </p>
                  )}

                  {result.certificate_url && (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a href={result.certificate_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Certificate
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
