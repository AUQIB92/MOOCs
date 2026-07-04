'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Users,
  Edit,
  Search,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
} from '@/components/icons'
import { toast } from 'sonner'
import { PageHeader } from '@/components/dashboard/page-header'
import { ROLE_LABELS, type Profile, type Department, type UserRole } from '@/lib/types'

interface UsersClientProps {
  profiles: Profile[]
  departments: Department[]
}

const PAGE_SIZE = 50

export function UsersClient({ profiles, departments }: UsersClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<{ role: UserRole; department_id: string }>({
    role: 'student',
    department_id: '',
  })

  // "Add HoD" creation dialog
  const [addOpen, setAddOpen] = useState(false)
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    password: '',
    department_id: '',
  })

  const supabase = createClient()

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    const arr = new Uint32Array(14)
    crypto.getRandomValues(arr)
    const pwd = Array.from(arr, (n) => chars[n % chars.length]).join('')
    setAddForm((f) => ({ ...f, password: pwd }))
  }

  const handleAddHod = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!addForm.full_name.trim() || !addForm.email.trim() || !addForm.department_id) {
      toast.error('Full name, email and department are required')
      return
    }
    if (addForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setAddSubmitting(true)
    try {
      const res = await fetch('/api/admin/hods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to add HoD')
        setAddSubmitting(false)
        return
      }
      toast.success(`${addForm.full_name} added as Head of Department`)
      setAddOpen(false)
      setAddForm({ full_name: '', email: '', password: '', department_id: '' })
      window.location.href = window.location.href
    } catch {
      toast.error('An unexpected error occurred')
      setAddSubmitting(false)
    }
  }

  const filteredProfiles = profiles.filter((p) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      p.full_name.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      (p.enrollment_number || '').toLowerCase().includes(query)

    const matchesRole = roleFilter === 'all' || p.role === roleFilter
    const matchesDept = deptFilter === 'all' || p.department_id === deptFilter

    return matchesSearch && matchesRole && matchesDept
  })

  const visibleProfiles = filteredProfiles.slice(0, visibleCount)

  const openEditDialog = (profile: Profile) => {
    setEditingProfile(profile)
    setFormData({ role: profile.role, department_id: profile.department_id || '' })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProfile) return

    if (formData.role === 'hod' && !formData.department_id) {
      toast.error('A Head of Department must be assigned a department')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        role: formData.role,
        department_id: formData.department_id || null,
      })
      .eq('id', editingProfile.id)

    if (error) {
      toast.error('Failed to save: ' + error.message)
      setIsSubmitting(false)
      return
    }

    toast.success('User updated!')
    setDialogOpen(false)
    setEditingProfile(null)
    setIsSubmitting(false)

    // Force hard reload to ensure data updates
    window.location.href = window.location.href
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Users"
        description="View all users and manage their role and department assignment"
        icon={Users}
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add HoD
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or enrollment number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setVisibleCount(PAGE_SIZE)
            }}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setVisibleCount(PAGE_SIZE) }}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="hod">Head of Department</SelectItem>
            <SelectItem value="faculty_coordinator">Faculty Coordinator</SelectItem>
            <SelectItem value="admin">MOOC Coordinator</SelectItem>
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setVisibleCount(PAGE_SIZE) }}>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {filteredProfiles.length} user(s) {searchQuery && 'matching your search'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProfiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">No users found</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Enrollment / Semester</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.full_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{profile.email}</TableCell>
                        <TableCell>
                          <Badge variant={profile.role === 'admin' ? 'default' : profile.role === 'hod' ? 'outline' : 'secondary'}>
                            {ROLE_LABELS[profile.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {profile.department?.code || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {profile.role === 'student'
                            ? `${profile.enrollment_number || 'N/A'} / Sem ${profile.semester ?? 'N/A'}`
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(profile)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {visibleCount < filteredProfiles.length && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                    Load more ({filteredProfiles.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingProfile(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              {editingProfile && `Update role and department for ${editingProfile.full_name}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="hod">Head of Department</SelectItem>
                  <SelectItem value="faculty_coordinator">Faculty Coordinator</SelectItem>
                  <SelectItem value="admin">MOOC Coordinator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department {formData.role === 'hod' && <span className="text-destructive">*</span>}</Label>
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
              {formData.role === 'hod' && (
                <p className="text-xs text-muted-foreground">
                  A Head of Department manages the curriculum, MOOC courses and mappings for this department.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || (formData.role === 'hod' && !formData.department_id)}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add HoD Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setAddForm({ full_name: '', email: '', password: '', department_id: '' }) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Head of Department</DialogTitle>
            <DialogDescription>
              Creates an active account that can sign in immediately and manage its department&apos;s curriculum.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddHod} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hod-name">Full Name *</Label>
              <Input
                id="hod-name"
                placeholder="e.g., Dr. A. Sharma"
                value={addForm.full_name}
                onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hod-email">Email *</Label>
              <Input
                id="hod-email"
                type="email"
                placeholder="hod.cse@gcet.ac.in"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hod-password">Temporary Password *</Label>
              <div className="flex gap-2">
                <Input
                  id="hod-password"
                  type="text"
                  placeholder="At least 6 characters"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  required
                />
                <Button type="button" variant="outline" onClick={generatePassword} className="shrink-0 gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this with the HoD; they can change it later from their account.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Department *</Label>
              <Select
                value={addForm.department_id}
                onValueChange={(v) => setAddForm({ ...addForm, department_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addSubmitting || !addForm.full_name.trim() || !addForm.email.trim() || !addForm.department_id || addForm.password.length < 6}
              >
                {addSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create HoD
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
