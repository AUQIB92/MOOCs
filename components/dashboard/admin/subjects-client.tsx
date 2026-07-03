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
  })
  
  const router = useRouter()
  const supabase = createClient()

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDept = deptFilter === 'all' || s.department_id === deptFilter
    
    return matchesSearch && matchesDept
  })

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      credits: 3,
      semester: 3,
      department_id: '',
      subject_type: 'core',
      is_replaceable: true,
    })
    setEditingSubject(null)
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
      code: formData.code,
      credits: formData.credits,
      semester: formData.semester,
      department_id: formData.department_id || null,
      subject_type: formData.subject_type,
      is_replaceable: formData.is_replaceable,
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Curriculum Subjects</h2>
          <p className="text-muted-foreground">
            Manage subjects that can be replaced by MOOC courses
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

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
                          <p className="font-medium">{subject.name}</p>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.name || !formData.code || !formData.department_id}>
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
