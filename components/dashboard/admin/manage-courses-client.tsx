'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  ExternalLink,
  Trash2,
} from '@/components/icons'
import { toast } from 'sonner'
import type { MoocCourse } from '@/lib/types'

interface ManageCoursesClientProps {
  courses: MoocCourse[]
}

export function ManageCoursesClient({ courses }: ManageCoursesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<MoocCourse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    provider: 'NPTEL',
    credits: 3,
    duration_weeks: 12,
    description: '',
    syllabus: '',
    external_url: '',
    is_active: true,
  })
  
  const router = useRouter()
  const supabase = createClient()

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      title: '',
      code: '',
      provider: 'NPTEL',
      credits: 3,
      duration_weeks: 12,
      description: '',
      syllabus: '',
      external_url: '',
      is_active: true,
    })
    setEditingCourse(null)
  }

  const openEditDialog = (course: MoocCourse) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      code: course.code,
      provider: course.provider,
      credits: course.credits,
      duration_weeks: course.duration_weeks,
      description: course.description || '',
      syllabus: course.syllabus || '',
      external_url: course.external_url || '',
      is_active: course.is_active,
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
      title: formData.title,
      code: formData.code,
      provider: formData.provider,
      credits: formData.credits,
      duration_weeks: formData.duration_weeks,
      description: formData.description || null,
      syllabus: formData.syllabus || null,
      external_url: formData.external_url || null,
      is_active: formData.is_active,
    }

    let error
    if (editingCourse) {
      const result = await supabase
        .from('mooc_courses')
        .update(data)
        .eq('id', editingCourse.id)
      error = result.error
    } else {
      const result = await supabase.from('mooc_courses').insert(data)
      error = result.error
    }

    if (error) {
      toast.error('Failed to save: ' + error.message)
      setIsSubmitting(false)
      return
    }

    toast.success(editingCourse ? 'Course updated!' : 'Course created!')
    resetForm()
    setDialogOpen(false)
    setIsSubmitting(false)
    
    // Force full page refresh to ensure data updates
    window.location.reload()
  }

  const handleDelete = async (course: MoocCourse) => {
    if (!confirm(`Delete "${course.title}"?`)) return
    
    const { error } = await supabase
      .from('mooc_courses')
      .delete()
      .eq('id', course.id)

    if (error) {
      toast.error('Failed to delete: ' + error.message)
      return
    }

    toast.success('Course deleted!')
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage MOOC Courses</h2>
          <p className="text-muted-foreground">
            Add, edit, and delete NPTEL/SWAYAM courses
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            {filteredCourses.length} course(s) {searchQuery && 'matching your search'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">No courses found</p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-xs text-muted-foreground font-mono">{course.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.provider}</Badge>
                      </TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>{course.duration_weeks} weeks</TableCell>
                      <TableCell>
                        {course.is_active ? (
                          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {course.external_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={course.external_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(course)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(course)} className="text-destructive hover:text-destructive">
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Update the course details' : 'Add a new MOOC course to the platform'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Machine Learning"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Course Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., NPTEL-CS101"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider *</Label>
                <Input
                  id="provider"
                  placeholder="e.g., NPTEL"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">Credits *</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="6"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_weeks">Duration (weeks) *</Label>
                <Input
                  id="duration_weeks"
                  type="number"
                  min="1"
                  max="52"
                  value={formData.duration_weeks}
                  onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) || 12 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="external_url">Course URL</Label>
              <Input
                id="external_url"
                type="url"
                placeholder="https://nptel.ac.in/courses/..."
                value={formData.external_url}
                onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief course description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Course is visible for registration</p>
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
                {editingCourse ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
