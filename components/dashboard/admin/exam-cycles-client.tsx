'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Calendar,
  Plus,
  Edit,
  Loader2,
  CheckCircle,
  XCircle,
} from '@/components/icons'
import { toast } from 'sonner'
import type { ExamCycle } from '@/lib/types'
import { format } from 'date-fns'

interface ExamCyclesClientProps {
  cycles: ExamCycle[]
}

export function ExamCyclesClient({ cycles }: ExamCyclesClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCycle, setEditingCycle] = useState<ExamCycle | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    result_upload_start: '',
    result_upload_end: '',
    result_upload_enabled: false,
    is_active: true,
  })
  
  const router = useRouter()
  const supabase = createClient()

  const resetForm = () => {
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      registration_deadline: '',
      result_upload_start: '',
      result_upload_end: '',
      result_upload_enabled: false,
      is_active: true,
    })
    setEditingCycle(null)
  }

  const openEditDialog = (cycle: ExamCycle) => {
    setEditingCycle(cycle)
    setFormData({
      name: cycle.name,
      start_date: cycle.start_date,
      end_date: cycle.end_date,
      registration_deadline: cycle.registration_deadline || '',
      result_upload_start: cycle.result_upload_start || '',
      result_upload_end: cycle.result_upload_end || '',
      result_upload_enabled: cycle.result_upload_enabled,
      is_active: cycle.is_active,
    })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = {
      name: formData.name,
      start_date: formData.start_date,
      end_date: formData.end_date,
      registration_deadline: formData.registration_deadline || null,
      result_upload_start: formData.result_upload_start || null,
      result_upload_end: formData.result_upload_end || null,
      result_upload_enabled: formData.result_upload_enabled,
      is_active: formData.is_active,
    }

    let error
    if (editingCycle) {
      const result = await supabase
        .from('exam_cycles')
        .update(data)
        .eq('id', editingCycle.id)
      error = result.error
    } else {
      const result = await supabase.from('exam_cycles').insert(data)
      error = result.error
    }

    if (error) {
      toast.error('Failed to save: ' + error.message)
      setIsSubmitting(false)
      return
    }

    toast.success(editingCycle ? 'Exam cycle updated!' : 'Exam cycle created!')
    setDialogOpen(false)
    resetForm()
    router.refresh()
    setIsSubmitting(false)
  }

  const toggleActive = async (cycle: ExamCycle) => {
    const { error } = await supabase
      .from('exam_cycles')
      .update({ is_active: !cycle.is_active })
      .eq('id', cycle.id)

    if (error) {
      toast.error('Failed to update: ' + error.message)
      return
    }

    toast.success(cycle.is_active ? 'Cycle deactivated' : 'Cycle activated')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exam Cycles</h2>
          <p className="text-muted-foreground">
            Manage NPTEL/SWAYAM exam cycles and registration periods
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Exam Cycle
        </Button>
      </div>

      {/* Cycles Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Exam Cycles</CardTitle>
          <CardDescription>
            {cycles.length} cycle(s) configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cycles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">No exam cycles</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first exam cycle to get started
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Exam Cycle
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Registration Deadline</TableHead>
                    <TableHead>Result Upload</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cycles.map((cycle) => (
                    <TableRow key={cycle.id}>
                      <TableCell className="font-medium">{cycle.name}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(cycle.start_date), 'MMM d, yyyy')} - {format(new Date(cycle.end_date), 'MMM d, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {cycle.registration_deadline
                          ? format(new Date(cycle.registration_deadline), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {cycle.result_upload_enabled ? (
                          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <XCircle className="mr-1 h-3 w-3" />
                            Disabled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {cycle.is_active ? (
                          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toggleActive(cycle)}>
                            {cycle.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(cycle)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCycle ? 'Edit Exam Cycle' : 'Create Exam Cycle'}</DialogTitle>
            <DialogDescription>
              {editingCycle ? 'Update the exam cycle details' : 'Add a new NPTEL/SWAYAM exam cycle'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Cycle Name *</Label>
              <Input
                id="name"
                placeholder="e.g., NPTEL Jan-May 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_deadline">Registration Deadline</Label>
              <Input
                id="registration_deadline"
                type="date"
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="result_upload_start">Result Upload Start</Label>
                <Input
                  id="result_upload_start"
                  type="date"
                  value={formData.result_upload_start}
                  onChange={(e) => setFormData({ ...formData, result_upload_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="result_upload_end">Result Upload End</Label>
                <Input
                  id="result_upload_end"
                  type="date"
                  value={formData.result_upload_end}
                  onChange={(e) => setFormData({ ...formData, result_upload_end: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>Result Upload Enabled</Label>
                <p className="text-sm text-muted-foreground">Allow students to upload results</p>
              </div>
              <Switch
                checked={formData.result_upload_enabled}
                onCheckedChange={(v) => setFormData({ ...formData, result_upload_enabled: v })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Cycle is visible to students</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCycle ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
