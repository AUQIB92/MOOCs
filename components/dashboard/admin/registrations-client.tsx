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
  Filter,
  Search,
  Loader2,
  Eye,
  ClipboardList,
} from '@/components/icons'
import { toast } from 'sonner'
import type { Registration } from '@/lib/types'
import { format } from 'date-fns'

interface AdminRegistrationsClientProps {
  registrations: Registration[]
}

export function AdminRegistrationsClient({ registrations }: AdminRegistrationsClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [adminRemarks, setAdminRemarks] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter
    const matchesSearch = 
      reg.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.student?.enrollment_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.mooc_course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedRegistration || !profile) return

    setIsProcessing(true)

    const { error } = await supabase
      .from('registrations')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        approved_by: profile.id,
        approved_at: new Date().toISOString(),
        admin_remarks: adminRemarks || null,
      })
      .eq('id', selectedRegistration.id)

    if (error) {
      toast.error('Failed to update registration: ' + error.message)
      setIsProcessing(false)
      return
    }

    toast.success(action === 'approve' ? 'Registration approved!' : 'Registration rejected')
    setDialogOpen(false)
    setSelectedRegistration(null)
    setAdminRemarks('')
    router.refresh()
    setIsProcessing(false)
  }

  const openReviewDialog = (registration: Registration) => {
    setSelectedRegistration(registration)
    setAdminRemarks(registration.admin_remarks || '')
    setDialogOpen(true)
  }

  const pendingCount = registrations.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Registrations</h2>
          <p className="text-muted-foreground">
            Manage student MOOC course registrations
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="outline" className="w-fit bg-warning/10 text-warning border-warning/20">
            {pendingCount} pending approval{pendingCount > 1 ? 's' : ''}
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
            <p className="text-lg font-medium text-muted-foreground">No registrations found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Registration Requests</CardTitle>
            <CardDescription>
              {filteredRegistrations.length} registration(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Replaces</TableHead>
                    <TableHead>Exam Cycle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reg.student?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {reg.student?.enrollment_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reg.mooc_course?.title}</p>
                          <p className="text-xs text-muted-foreground">{reg.mooc_course?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{reg.curriculum_subject?.code}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{reg.exam_cycle?.name}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(reg.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(reg.created_at), 'MMM d, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openReviewDialog(reg)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Review
                        </Button>
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
            <DialogTitle>Review Registration</DialogTitle>
            <DialogDescription>
              Approve or reject this registration request
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-6 py-4">
              {/* Student Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-medium">{selectedRegistration.student?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.student?.enrollment_number}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{selectedRegistration.mooc_course?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.mooc_course?.code} | {selectedRegistration.mooc_course?.credits} credits
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Replaces Subject</p>
                  <p className="font-medium">{selectedRegistration.curriculum_subject?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.curriculum_subject?.code}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Exam Cycle</p>
                  <p className="font-medium">{selectedRegistration.exam_cycle?.name}</p>
                </div>
              </div>

              {/* Current Status */}
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Current Status:</p>
                {getStatusBadge(selectedRegistration.status)}
              </div>

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
            {selectedRegistration?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleAction('reject')}
                  disabled={isProcessing}
                >
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reject
                </Button>
                <Button onClick={() => handleAction('approve')} disabled={isProcessing}>
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
