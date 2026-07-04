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
  FileText,
  Plus,
  Edit,
  Search,
  Loader2,
  Trash2,
  Filter,
  Link2,
  AlertTriangle,
} from '@/components/icons'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { PageHeader } from '@/components/dashboard/page-header'
import type { MoocMapping, MoocCourse, CurriculumSubject, Department } from '@/lib/types'

interface MappingsClientProps {
  mappings: MoocMapping[]
  courses: MoocCourse[]
  subjects: CurriculumSubject[]
  departments: Department[]
}

export function MappingsClient({ mappings, courses, subjects, departments }: MappingsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMapping, setEditingMapping] = useState<MoocMapping | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    mooc_course_id: '',
    curriculum_subject_id: '',
    min_score: 50,
    elite_required: 'none' as 'none' | 'silver' | 'gold',
    is_active: true,
  })
  
  const router = useRouter()
  const supabase = createClient()

  const { profile } = useAuth()
  // HoDs can only map MOOCs onto their own department's subjects.
  const isHod = profile?.role === 'hod'
  const hodDeptId = profile?.department_id ?? ''
  const hodDeptName = departments.find((d) => d.id === hodDeptId)?.name ?? 'your department'
  const effectiveDeptFilter = isHod ? hodDeptId : deptFilter

  const filteredMappings = mappings.filter((m) => {
    const course = m.mooc_course
    const subject = m.curriculum_subject
    const dept = subject?.department

    const matchesSearch =
      course?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course?.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject?.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDept = effectiveDeptFilter === 'all' || dept?.id === effectiveDeptFilter

    return matchesSearch && matchesDept
  })

  const resetForm = () => {
    setFormData({
      mooc_course_id: '',
      curriculum_subject_id: '',
      min_score: 50,
      elite_required: 'none',
      is_active: true,
    })
    setEditingMapping(null)
  }

  const openEditDialog = (mapping: MoocMapping) => {
    setEditingMapping(mapping)
    setFormData({
      mooc_course_id: mapping.mooc_course_id,
      curriculum_subject_id: mapping.curriculum_subject_id,
      min_score: mapping.min_score,
      elite_required: mapping.elite_required,
      is_active: mapping.is_active,
    })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // HoDs may only map MOOCs onto their own department's subjects. This mirrors
    // the database RLS policy, but gives a clear message instead of a raw error.
    if (isHod) {
      const subject = subjects.find((s) => s.id === formData.curriculum_subject_id)
      if (!hodDeptId || !subject || subject.department_id !== hodDeptId) {
        toast.error("You can only map MOOCs to your own department's curriculum subjects")
        return
      }
    }

    setIsSubmitting(true)

    const data = {
      mooc_course_id: formData.mooc_course_id,
      curriculum_subject_id: formData.curriculum_subject_id,
      min_score: formData.min_score,
      elite_required: formData.elite_required,
      is_active: formData.is_active,
    }

    let error
    if (editingMapping) {
      const result = await supabase
        .from('mooc_mappings')
        .update(data)
        .eq('id', editingMapping.id)
      error = result.error
    } else {
      const result = await supabase.from('mooc_mappings').insert(data)
      error = result.error
    }

    if (error) {
      toast.error('Failed to save: ' + error.message)
      setIsSubmitting(false)
      return
    }

    toast.success(editingMapping ? 'Mapping updated!' : 'Mapping created!')
    resetForm()
    setDialogOpen(false)
    setIsSubmitting(false)
    window.location.reload()
  }

  const handleDelete = async (mapping: MoocMapping) => {
    if (!confirm('Delete this mapping?')) return
    
    const { error } = await supabase
      .from('mooc_mappings')
      .delete()
      .eq('id', mapping.id)

    if (error) {
      toast.error('Failed to delete: ' + error.message)
      return
    }

    toast.success('Mapping deleted!')
    window.location.reload()
  }

  const getSubjectOptions = () => {
    // HoDs may only ever pick their own department's subjects — never fall back
    // to "all" (e.g. before the profile loads, or if no department is assigned).
    if (isHod) {
      return hodDeptId ? subjects.filter((s) => s.department_id === hodDeptId) : []
    }
    if (deptFilter === 'all') return subjects
    return subjects.filter((s) => s.department_id === deptFilter)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Curriculum Mapping"
        description={
          isHod
            ? `Link MOOC courses to ${hodDeptName}'s curriculum subjects`
            : 'Link MOOC courses to curriculum subjects for credit replacement'
        }
        icon={Link2}
        actions={
          <Button onClick={openCreateDialog} disabled={isHod && !hodDeptId}>
            <Plus className="mr-2 h-4 w-4" />
            Add Mapping
          </Button>
        }
      />

      {isHod && !hodDeptId && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4 text-warning">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">No department assigned to your account</p>
            <p className="text-sm text-warning/80">
              Ask a MOOC Coordinator to assign your department before you can manage mappings.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses or subjects..."
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

      {/* Mappings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Mappings</CardTitle>
          <CardDescription>
            {filteredMappings.length} mapping(s) {searchQuery && 'matching your search'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMappings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Link2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">No mappings found</p>
              <p className="text-sm text-muted-foreground mb-4">Create a mapping to link MOOC courses with curriculum subjects</p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Mapping
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MOOC Course</TableHead>
                    <TableHead>Curriculum Subject</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Min Score</TableHead>
                    <TableHead>Elite Required</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{mapping.mooc_course?.title}</p>
                          <p className="text-xs text-muted-foreground font-mono">{mapping.mooc_course?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{mapping.curriculum_subject?.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{mapping.curriculum_subject?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {mapping.curriculum_subject?.department?.code || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{mapping.min_score}%</Badge>
                      </TableCell>
                      <TableCell>
                        {mapping.elite_required === 'none' ? (
                          <span className="text-muted-foreground">None</span>
                        ) : (
                          <Badge variant="outline" className="capitalize">
                            {mapping.elite_required}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {mapping.is_active ? (
                          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(mapping)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(mapping)} className="text-destructive hover:text-destructive">
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
            <DialogTitle>{editingMapping ? 'Edit Mapping' : 'Add New Mapping'}</DialogTitle>
            <DialogDescription>
              {editingMapping ? 'Update the mapping details' : 'Link a MOOC course to a curriculum subject'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* MOOC Course Selection */}
            <div className="space-y-2">
              <Label>MOOC Course *</Label>
              <Select 
                value={formData.mooc_course_id} 
                onValueChange={(v) => setFormData({ ...formData, mooc_course_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select MOOC course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Curriculum Subject Selection */}
            <div className="space-y-2">
              <Label>Curriculum Subject *</Label>
              <Select 
                value={formData.curriculum_subject_id} 
                onValueChange={(v) => setFormData({ ...formData, curriculum_subject_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select curriculum subject" />
                </SelectTrigger>
                <SelectContent>
                  {getSubjectOptions().map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code}) - {subject.department?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Score */}
            <div className="space-y-2">
              <Label>Minimum Score (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.min_score}
                onChange={(e) => setFormData({ ...formData, min_score: parseInt(e.target.value) || 50 })}
              />
              <p className="text-xs text-muted-foreground">Student must score at least this percentage</p>
            </div>

            {/* Elite Status Required */}
            <div className="space-y-2">
              <Label>Elite Status Required</Label>
              <Select 
                value={formData.elite_required} 
                onValueChange={(v) => setFormData({ ...formData, elite_required: v as 'none' | 'silver' | 'gold' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Mapping is available for enrollment</p>
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
              <Button type="submit" disabled={isSubmitting || !formData.mooc_course_id || !formData.curriculum_subject_id}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingMapping ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
