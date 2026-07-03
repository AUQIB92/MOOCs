'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  GraduationCap,
  Home,
  BookOpen,
  FileText,
  Award,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  ClipboardList,
  Building2,
  UserCheck,
  Menu,
  Bell,
  Upload,
  type LucideIcon,
} from '@/components/icons'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/lib/auth-context'
import type { UserRole } from '@/lib/types'

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: Home, roles: ['student', 'faculty_coordinator', 'admin'] },
  { title: 'MOOC Courses', href: '/dashboard/courses', icon: BookOpen, roles: ['student', 'faculty_coordinator', 'admin'] },
  { title: 'Record Enrollment', href: '/dashboard/enroll', icon: FileText, roles: ['student'] },
  { title: 'My Enrollments', href: '/dashboard/registrations', icon: ClipboardList, roles: ['student'] },
  { title: 'Upload Results', href: '/dashboard/results', icon: Upload, roles: ['student'] },
  { title: 'My Certificates', href: '/dashboard/certificates', icon: Award, roles: ['student'] },
  { title: 'All Enrollments', href: '/dashboard/admin/registrations', icon: ClipboardList, roles: ['faculty_coordinator', 'admin'] },
  { title: 'Verify Results', href: '/dashboard/admin/verify', icon: UserCheck, roles: ['faculty_coordinator', 'admin'] },
  { title: 'Curriculum Mapping', href: '/dashboard/admin/mappings', icon: FileText, roles: ['admin'] },
  { title: 'Curriculum Subjects', href: '/dashboard/admin/subjects', icon: BookOpen, roles: ['admin'] },
  { title: 'Exam Cycles', href: '/dashboard/admin/cycles', icon: Calendar, roles: ['admin'] },
  { title: 'Manage Courses', href: '/dashboard/admin/courses', icon: BookOpen, roles: ['admin'] },
  { title: 'Departments', href: '/dashboard/admin/departments', icon: Building2, roles: ['admin'] },
  { title: 'Users', href: '/dashboard/admin/users', icon: Users, roles: ['admin'] },
  { title: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3, roles: ['admin'] },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  const filteredNavItems = navItems.filter(
    (item) => profile && item.roles.includes(profile.role)
  )

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-[70px]' : 'w-[260px]'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-sidebar-foreground">GCET MOOC</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    collapsed && 'justify-center px-2',
                    isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Menu */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 px-2',
                collapsed && 'justify-center'
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[140px]">
                    {profile?.full_name || 'User'}
                  </span>
                  <span className="text-xs text-sidebar-foreground/60">
                    {profile?.role === 'admin' ? 'MOOC Coordinator' : profile?.role === 'faculty_coordinator' ? 'Faculty Coordinator' : profile?.enrollment_number || 'N/A'}
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

export function DashboardHeader() {
  const { profile } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              Welcome back, {profile?.full_name || 'User'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {profile?.role === 'admin' ? 'MOOC Coordinator' : profile?.role === 'faculty_coordinator' ? 'Faculty Coordinator' : `${profile?.department?.name || 'N/A'} | ${profile?.enrollment_number || 'N/A'}`}
            </p>
          </div>
        </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
      </div>
    </header>
  )
}
