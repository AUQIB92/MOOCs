'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Building2,
  Plus,
  Edit,
  Search,
  Loader2,
  Trash2,
} from '@/components/icons'
import { toast } from 'sonner'
import type { Department } from '@/lib/types'

interface DepartmentsClientProps {
  departments: Department[]
}

export function DepartmentsClient({ departments }: DepartmentsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', code: '' })

  const supabase = createClient()

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setFormData({ name: '', code: '' })
    setEditingDepartment(null)
  }

  const openEditDialog = (department: Department) => {
    setEditingDepartment(department)
    setFormData({ name: department.name, code: department.code })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = { name: formData.name, code: formData.code }

    try {
      let error
      if (editingDepartment) {
        const result = await supabase
          .from('departments')
          .update(data)
          .eq('id', editingDepartment.id)
        error = result.error
      } else {
        const result = await supabase.from('departments').insert(data)
        error = result.error
      }

      if (error) {
        if (error.code === '23505') {
          toast.error('A department with this code already exists')
        } else {
          toast.error('Failed to save: ' + error.message)
        }
        setIsSubmitting(false)
        return
      }

      toast.success(editingDepartment ? 'Department updated!' : 'Department created!')
      resetForm()
      setDialogOpen(false)
      setIsSubmitting(false)

      // Force hard reload to ensure data updates
      window.location.href = window.location.href
    } catch (err) {
      toast.error('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (department: Department) => {
    if (!confirm(`Delete "${department.name}"?`)) return

    const [{ count: studentCount }, { count: subjectCount }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('department_id', department.id),
      supabase
        .from('curriculum_subjects')
        .select('id', { count: 'exact', head: true })
        .eq('department_id', department.id),
    ])

    if ((studentCount || 0) > 0 || (subjectCount || 0) > 0) {
      toast.error(
        `Cannot delete: ${studentCount || 0} user(s) and ${subjectCount || 0} subject(s) still use this department. Reassign them first.`
      )
      return
    }

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', department.id)

    if (error) {
      toast.error('Failed to delete: ' + error.message)
      return
    }

    toast.success('Department deleted!')
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Departments</h2>
          <p className="text-muted-foreground">
            Manage the academic departments used across the platform
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>
            {filteredDepartments.length} department(s) {searchQuery && 'matching your search'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDepartments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Building2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">No departments found</p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell className="font-medium">{department.name}</TableCell>
                      <TableCell className="font-mono text-sm">{department.code}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(department)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(department)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
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
            <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add New Department'}</DialogTitle>
            <DialogDescription>
              {editingDepartment ? 'Update the department details' : 'Add a new academic department'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Department Name *</Label>
              <Input
                placeholder="e.g., Computer Engineering"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Department Code *</Label>
              <Input
                placeholder="e.g., CE"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.name || !formData.code}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingDepartment ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
