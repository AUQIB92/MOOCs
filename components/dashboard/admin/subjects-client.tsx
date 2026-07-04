'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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
  BookOpen,
  Plus,
  Edit,
  Search,
  Loader2,
  Trash2,
  Filter,
} from '@/components/icons'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { PageHeader } from '@/components/dashboard/page-header'
import { AlertTriangle, Users } from '@/components/icons'
import { cn } from '@/lib/utils'
import type { CurriculumSubject, Department } from '@/lib/types'

interface SubjectsClientProps {
  subjects: CurriculumSubject[]
  departments: Department[]
}

export function SubjectsClient({ subjects, departments }: SubjectsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<CurriculumSubject | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 3,
    semester: 3,
    department_id: '',
    subject_type: 'core',
    is_replaceable: true,
    is_open_elective: false,
    open_to_departments: [] as string[],
    exclude_own_department: false,
  })

  const router = useRouter()
  const supabase = createClient()

  const { profile } = useAuth()
  // Heads of Department are locked to their own department; admins see everything.
  const isHod = profile?.role === 'hod'
  const hodDeptId = profile?.department_id ?? ''
  const hodDeptName = departments.find((d) => d.id === hodDeptId)?.name ?? 'your department'
  // The department that "owns" the subject being edited: the HoD's own dept, or
  // (for admins) whichever department they picked in the form.
  const ownDeptId = isHod ? hodDeptId : formData.department_id
  const ownDeptName = departments.find((d) => d.id === ownDeptId)?.name ?? 'The owning department'

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDept = deptFilter === 'all' || s.department_id === deptFilter

    // HoDs only ever see (and can act on) their own department's subjects.
    const matchesScope = !isHod || s.department_id === hodDeptId

    return matchesSearch && matchesDept && matchesScope
  })

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      credits: 3,
      semester: 3,
      department_id: isHod ? hodDeptId : '',
      subject_type: 'core',
      is_replaceable: true,
      is_open_elective: false,
      open_to_departments: [],
      exclude_own_department: false,
    })
    setEditingSubject(null)
  }

  const toggleOpenDept = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      open_to_departments: prev.open_to_departments.includes(id)
        ? prev.open_to_departments.filter((d) => d !== id)
        : [...prev.open_to_departments, id],
    }))
  }

  // When "other departments only" is on, drop the owning department from the
  // eligibility list so its own students can never see the OEC.
  const setExcludeOwn = (v: boolean) => {
    setFormData((prev) => {
      const own = isHod ? hodDeptId : prev.department_id
      return {
        ...prev,
        exclude_own_department: v,
        open_to_departments: v
          ? prev.open_to_departments.filter((d) => d !== own)
          : prev.open_to_departments,
      }
    })
  }

  const openEditDialog = (subject: CurriculumSubject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      semester: subject.semester,
      department_id: subject.department_id || '',
      subject_type: subject.subject_type,
      is_replaceable: subject.is_replaceable,
      is_open_elective: subject.is_open_elective ?? false,
      open_to_departments: subject.open_to_departments ?? [],
      // "Other departments only" was in effect if the OEC's own department is
      // not in its eligibility list.
      exclude_own_department:
        (subject.is_open_elective ?? false) &&
        !(subject.open_to_departments ?? []).includes(subject.department_id ?? ''),
    })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.is_open_elective && formData.open_to_departments.length === 0) {
      toast.error('Select at least one department this Open Elective is offered to')
      return
    }

    setIsSubmitting(true)

    // Final eligibility list: empty for non-OECs, and with the owning department
    // removed when "other departments only" is on.
    const openList = !formData.is_open_elective
      ? []
      : formData.exclude_own_department
        ? formData.open_to_departments.filter((d) => d !== ownDeptId)
        : formData.open_to_departments

    const data = {
      name: formData.name,
      code: formData.code,
      credits: formData.credits,
      semester: formData.semester,
      department_id: formData.department_id || null,
      subject_type: formData.subject_type,
      is_replaceable: formData.is_replaceable,
      is_open_elective: formData.is_open_elective,
      open_to_departments: openList,
    }

    try {
      let error
      if (editingSubject) {
        const result = await supabase
          .from('curriculum_subjects')
          .update(data)
          .eq('id', editingSubject.id)
        error = result.error
      } else {
        const result = await supabase.from('curriculum_subjects').insert(data)
        error = result.error
      }

      if (error) {
        if (error.code === '23505') {
          toast.error('A subject with this code already exists in this department')
        } else {
          toast.error('Failed to save: ' + error.message)
        }
        setIsSubmitting(false)
        return
      }

      toast.success(editingSubject ? 'Subject updated!' : 'Subject created!')
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

  const handleDelete = async (subject: CurriculumSubject) => {
    if (!confirm(`Delete "${subject.name}"? This will also remove all mappings.`)) return
    
    const { error } = await supabase
      .from('curriculum_subjects')
      .delete()
      .eq('id', subject.id)

    if (error) {
      toast.error('Failed to delete: ' + error.message)
      return
    }

    toast.success('Subject deleted!')
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Curriculum Subjects"
        description={
          isHod
            ? `Manage ${hodDeptName}'s subjects that can be replaced by MOOC courses`
            : 'Manage subjects that can be replaced by MOOC courses'
        }
        icon={BookOpen}
        actions={
          <Button onClick={openCreateDialog} disabled={isHod && !hodDeptId}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        }
      />

      {/* HoD without a department cannot scope any writes */}
      {isHod && !hodDeptId && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4 text-warning">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">No department assigned to your account</p>
            <p className="text-sm text-warning/80">
              Ask a MOOC Coordinator to assign your department before you can manage curriculum.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {!isHod && (
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subjects</CardTitle>
          <CardDescription>
            {filteredSubjects.length} subject(s) {searchQuery && 'matching your search'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">No subjects found</p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Replaceable</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{subject.name}</p>
                            {subject.is_open_elective && (
                              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                                OEC
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">{subject.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {subject.department?.code || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {subject.subject_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{subject.credits}</TableCell>
                      <TableCell>{subject.semester}</TableCell>
                      <TableCell>
                        {subject.is_replaceable ? (
                          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(subject)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(subject)} className="text-destructive hover:text-destructive">
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
            <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
            <DialogDescription>
              {editingSubject ? 'Update the subject details' : 'Add a new curriculum subject'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject Name */}
            <div className="space-y-2">
              <Label>Subject Name *</Label>
              <Input
                placeholder="e.g., Data Structures"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Code & Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject Code *</Label>
                <Input
                  placeholder="e.g., CS202"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Department *</Label>
                {isHod ? (
                  <Input value={hodDeptName} disabled readOnly />
                ) : (
                  <Select
                    value={formData.department_id}
                    onValueChange={(v) => setFormData({ ...formData, department_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Credits & Semester */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Credits *</Label>
                <Input
                  type="number"
                  min="1"
                  max="6"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Semester *</Label>
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 3 })}
                  required
                />
              </div>
            </div>

            {/* Subject Type */}
            <div className="space-y-2">
              <Label>Subject Type</Label>
              <Select 
                value={formData.subject_type} 
                onValueChange={(v) => setFormData({ ...formData, subject_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="elective">Elective</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Replaceable Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>Replaceable by MOOC</Label>
                <p className="text-sm text-muted-foreground">Students can replace this subject with a MOOC course</p>
              </div>
              <Switch
                checked={formData.is_replaceable}
                onCheckedChange={(v) => setFormData({ ...formData, is_replaceable: v })}
              />
            </div>

            {/* Open Elective (OEC) */}
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Open Elective (OEC)</Label>
                  <p className="text-sm text-muted-foreground">Offer this subject to students of other departments</p>
                </div>
                <Switch
                  checked={formData.is_open_elective}
                  onCheckedChange={(v) => setFormData({ ...formData, is_open_elective: v })}
                />
              </div>

              {formData.is_open_elective && (
                <div className="space-y-3 border-t pt-3">
                  {/* Exclude the owning department's students */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <Label>Other departments only</Label>
                      <p className="text-sm text-muted-foreground">
                        {ownDeptName}&apos;s own students won&apos;t see this OEC
                      </p>
                    </div>
                    <Switch
                      checked={formData.exclude_own_department}
                      onCheckedChange={setExcludeOwn}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-sm">
                      <Users className="h-3.5 w-3.5" />
                      Visible to students of *
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {departments
                        .filter((dept) => !(formData.exclude_own_department && dept.id === ownDeptId))
                        .map((dept) => {
                          const selected = formData.open_to_departments.includes(dept.id)
                          const isOwn = dept.id === ownDeptId
                          return (
                            <button
                              type="button"
                              key={dept.id}
                              onClick={() => toggleOpenDept(dept.id)}
                              aria-pressed={selected}
                              title={isOwn ? `${dept.name} (owning department)` : dept.name}
                              className={cn(
                                'cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                                selected
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border text-muted-foreground hover:bg-muted'
                              )}
                            >
                              {dept.code}
                              {isOwn ? ' (own)' : ''}
                            </button>
                          )
                        })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formData.exclude_own_department
                        ? 'Pick the other departments whose students can take this OEC.'
                        : 'Pick the departments whose students can take this OEC — including your own, unless you turn on “Other departments only”.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.name || !formData.code || !formData.department_id || (formData.is_open_elective && formData.open_to_departments.length === 0)}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSubject ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
