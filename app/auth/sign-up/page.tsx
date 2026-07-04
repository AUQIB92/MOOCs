'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from '@/components/icons'
import { AuthShell, AuthAlert } from '@/components/auth/auth-shell'
import { toast } from 'sonner'
import type { Department } from '@/lib/types'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    enrollmentNumber: '',
    semester: '',
    departmentId: '',
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDeps, setLoadingDeps] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Failed to fetch departments:', error)
      }
      if (data) {
        setDepartments(data)
      }
      setLoadingDeps(false)
    }
    fetchDepartments()
  }, [supabase])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (!formData.departmentId) {
      setError('Please select a department')
      setLoading(false)
      return
    }

    const semester = parseInt(formData.semester)
    if (!semester || semester < 3) {
      setError('You must be in 3rd semester or above to register')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
          `${window.location.origin}/auth/callback`,
        data: {
          full_name: formData.fullName,
          enrollment_number: formData.enrollmentNumber,
          semester: parseInt(formData.semester) || 1,
          department_id: formData.departmentId || null,
          role: 'student',
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    toast.success('Account created! Please check your email to confirm.')
    router.push('/auth/sign-up-success')
  }

  return (
    <AuthShell
      wide
      title="Create Student Account"
      description="One-time registration for GCET MOOC Manager"
      footer={
        <>
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignUp} className="space-y-4">
            {error && <AuthAlert>{error}</AuthAlert>}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">College Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@gcet.ac.in"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollmentNumber">Enrollment Number</Label>
              <Input
                id="enrollmentNumber"
                placeholder="e.g., 21BECE001"
                value={formData.enrollmentNumber}
                onChange={(e) => handleChange('enrollmentNumber', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select value={formData.semester} onValueChange={(v) => handleChange('semester', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Only 3rd semester and above can register</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                {loadingDeps ? (
                  <div className="flex h-10 items-center justify-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : departments.length === 0 ? (
                  <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                    No departments available
                  </div>
                ) : (
                  <Select value={formData.departmentId} onValueChange={(v) => handleChange('departmentId', v)}>
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

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
      </form>
    </AuthShell>
  )
}
