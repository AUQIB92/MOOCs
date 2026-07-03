'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  Filter,
  ClipboardList,
  ArrowRight,
  Upload,
  Eye,
} from '@/components/icons'
import type { Registration } from '@/lib/types'
import { format } from 'date-fns'

interface RegistrationsClientProps {
  registrations: Registration[]
}

export function RegistrationsClient({ registrations }: RegistrationsClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredRegistrations = registrations.filter((reg) => {
    if (statusFilter === 'all') return true
    return reg.status === statusFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getResultBadge = (result: Registration['result']) => {
    if (!result) return <Badge variant="outline">No Result</Badge>
    
    switch (result.status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Clock className="mr-1 h-3 w-3" />
            Pending Verification
          </Badge>
        )
      case 'verified':
        return (
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified ({result.score}%)
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{result.status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Enrollments</h2>
          <p className="text-muted-foreground">
            Track your recorded MOOC enrollments and results
          </p>
        </div>
        <Link href="/dashboard/courses">
          <Button>
            Record New Enrollment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Registrations Table */}
      {filteredRegistrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">No enrollments recorded</p>
            <p className="text-sm text-muted-foreground mb-4">
              {statusFilter !== 'all' 
                ? 'Try changing the filter or record a new enrollment'
                : 'Start by browsing approved courses'}
            </p>
            <Link href="/dashboard/courses">
              <Button>Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Enrollment History</CardTitle>
            <CardDescription>
              {filteredRegistrations.length} enrollment(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Replaces</TableHead>
                    <TableHead>Exam Cycle</TableHead>
                    <TableHead>Proof</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reg.mooc_course?.title}</p>
                          <p className="text-xs text-muted-foreground">{reg.mooc_course?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reg.curriculum_subject?.name}</p>
                          <p className="text-xs text-muted-foreground">{reg.curriculum_subject?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{reg.exam_cycle?.name}</p>
                      </TableCell>
                      <TableCell>
                        {reg.registration_proof_url ? (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={reg.registration_proof_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </a>
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">No proof</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(reg.status)}</TableCell>
                      <TableCell>{getResultBadge(reg.result)}</TableCell>
                      <TableCell className="text-right">
                        {reg.status === 'approved' && !reg.result && (
                          <Link href={`/dashboard/results?registration=${reg.id}`}>
                            <Button variant="outline" size="sm">
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Result
                            </Button>
                          </Link>
                        )}
                        {reg.result?.certificate_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={reg.result.certificate_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Certificate
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
