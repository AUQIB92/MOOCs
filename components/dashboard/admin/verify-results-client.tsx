'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  ExternalLink,
  Filter,
  Search,
  Loader2,
  Eye,
  UserCheck,
} from '@/components/icons'
import { toast } from 'sonner'
import type { Result } from '@/lib/types'
import { format } from 'date-fns'

interface VerifyResultsClientProps {
  results: (Result & { registration: any })[]
}

export function VerifyResultsClient({ results }: VerifyResultsClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResult, setSelectedResult] = useState<(Result & { registration: any }) | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [adminRemarks, setAdminRemarks] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const filteredResults = results.filter((result) => {
    const matchesStatus = statusFilter === 'all' || result.status === statusFilter
    const matchesSearch = 
      result.registration?.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.registration?.student?.enrollment_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.registration?.mooc_course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
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
      case 'verified':
        return (
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified
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

  const handleVerify = async (action: 'verify' | 'reject') => {
    if (!selectedResult || !profile) return

    setIsProcessing(true)

    const { error } = await supabase
      .from('results')
      .update({
        status: action === 'verify' ? 'verified' : 'rejected',
        verified_by: profile.id,
        verified_at: new Date().toISOString(),
        admin_remarks: adminRemarks || null,
        curriculum_replaced: action === 'verify',
      })
      .eq('id', selectedResult.id)

    if (error) {
      toast.error('Failed to update result: ' + error.message)
      setIsProcessing(false)
      return
    }

    toast.success(action === 'verify' ? 'Result verified successfully!' : 'Result rejected')
    setDialogOpen(false)
    setSelectedResult(null)
    setAdminRemarks('')
    router.refresh()
    setIsProcessing(false)
  }

  const openReviewDialog = (result: Result & { registration: any }) => {
    setSelectedResult(result)
    setAdminRemarks(result.admin_remarks || '')
    setDialogOpen(true)
  }

  const pendingCount = results.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Verify Results</h2>
          <p className="text-muted-foreground">
            Review and verify student MOOC course results
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="outline" className="w-fit bg-warning/10 text-warning border-warning/20">
            {pendingCount} pending verification{pendingCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student name, enrollment, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Table */}
      {filteredResults.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserCheck className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">No results found</p>
            <p className="text-sm text-muted-foreground">
              {statusFilter === 'pending' 
                ? 'No pending verifications at the moment'
                : 'Try adjusting your search or filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Result Submissions</CardTitle>
            <CardDescription>
              {filteredResults.length} result(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Elite Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{result.registration?.student?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {result.registration?.student?.enrollment_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{result.registration?.mooc_course?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {result.registration?.mooc_course?.code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-medium">{result.score}%</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {result.elite_status === 'none' ? '-' : result.elite_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(result.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(result.created_at), 'MMM d, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {result.certificate_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={result.certificate_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => openReviewDialog(result)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Result</DialogTitle>
            <DialogDescription>
              Verify or reject this result submission
            </DialogDescription>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-6 py-4">
              {/* Student Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-medium">{selectedResult.registration?.student?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedResult.registration?.student?.enrollment_number}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{selectedResult.registration?.mooc_course?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedResult.registration?.mooc_course?.code}
                  </p>
                </div>
              </div>

              {/* Result Details */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold">{selectedResult.score}%</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-sm text-muted-foreground">Elite Status</p>
                  <p className="text-2xl font-bold capitalize">
                    {selectedResult.elite_status === 'none' ? '-' : selectedResult.elite_status}
                  </p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedResult.status)}</div>
                </div>
              </div>

              {/* Certificate Link */}
              {selectedResult.certificate_url && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Certificate URL</p>
                  <div className="flex items-center gap-2">
                    <Input value={selectedResult.certificate_url} readOnly className="flex-1" />
                    <Button variant="outline" asChild>
                      <a href={selectedResult.certificate_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Admin Remarks */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Admin Remarks</p>
                <Textarea
                  placeholder="Add any remarks or notes..."
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {selectedResult?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleVerify('reject')}
                  disabled={isProcessing}
                >
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reject
                </Button>
                <Button onClick={() => handleVerify('verify')} disabled={isProcessing}>
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
