'use client'

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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  ClipboardList,
  Building2,
  UserCheck,
  Menu,
  X,
  Bell,
  Upload,
  Link2,
  Library,
  type LucideIcon,
} from '@/components/icons'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/lib/auth-context'
import { ROLE_LABELS, type UserRole } from '@/lib/types'

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

// Grouped, role-filtered navigation. Groups with no visible items are hidden,
// so each role sees a short, well-labelled menu instead of one long flat list.
const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: Home, roles: ['student', 'faculty_coordinator', 'admin', 'hod'] },
      { title: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3, roles: ['admin'] },
    ],
  },
  {
    label: 'Learn',
    items: [
      { title: 'MOOC Courses', href: '/dashboard/courses', icon: BookOpen, roles: ['student', 'faculty_coordinator'] },
      { title: 'Record Enrollment', href: '/dashboard/enroll', icon: FileText, roles: ['student'] },
      { title: 'My Enrollments', href: '/dashboard/registrations', icon: ClipboardList, roles: ['student'] },
      { title: 'Upload Results', href: '/dashboard/results', icon: Upload, roles: ['student'] },
      { title: 'My Certificates', href: '/dashboard/certificates', icon: Award, roles: ['student'] },
    ],
  },
  {
    label: 'Approvals',
    items: [
      { title: 'Enrollments', href: '/dashboard/admin/registrations', icon: ClipboardList, roles: ['hod', 'faculty_coordinator', 'admin'] },
      { title: 'Verify Results', href: '/dashboard/admin/verify', icon: UserCheck, roles: ['faculty_coordinator', 'admin'] },
    ],
  },
  {
    label: 'Curriculum',
    items: [
      { title: 'Curriculum Subjects', href: '/dashboard/admin/subjects', icon: BookOpen, roles: ['admin', 'hod'] },
      { title: 'MOOC Courses', href: '/dashboard/admin/courses', icon: Library, roles: ['admin', 'hod'] },
      { title: 'Curriculum Mapping', href: '/dashboard/admin/mappings', icon: Link2, roles: ['admin', 'hod'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { title: 'Exam Cycles', href: '/dashboard/admin/cycles', icon: Calendar, roles: ['admin'] },
      { title: 'Departments', href: '/dashboard/admin/departments', icon: Building2, roles: ['admin'] },
      { title: 'Users', href: '/dashboard/admin/users', icon: Users, roles: ['admin'] },
    ],
  },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Shared sidebar body (logo header, nav list, user menu). Rendered inside the
 * fixed desktop rail and the mobile off-canvas drawer.
 * `collapsed` only applies on desktop; the mobile drawer always shows labels.
 */
function SidebarContent({
  collapsed,
  headerAction,
  onNavigate,
}: {
  collapsed: boolean
  headerAction?: React.ReactNode
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => profile && item.roles.includes(profile.role)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <>
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-sidebar-foreground">GCET MOOC</span>
          )}
        </Link>
        {headerAction}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className={cn('px-3', collapsed ? 'space-y-2' : 'space-y-5')}>
          {visibleGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                // Dashboard must match exactly, otherwise every /dashboard/* route
                // would keep it highlighted alongside the real active item.
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link key={item.href} href={item.href} onClick={onNavigate}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-3',
                        collapsed && 'justify-center px-2',
                        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Button>
                  </Link>
                )
              })}
            </div>
          ))}
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
                    {profile?.role === 'student'
                      ? profile?.enrollment_number || 'N/A'
                      : profile
                        ? ROLE_LABELS[profile.role]
                        : 'N/A'}
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
    </>
  )
}

interface DashboardSidebarProps {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (value: boolean) => void
}

export function DashboardSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: DashboardSidebarProps) {
  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:flex',
          collapsed ? 'w-[70px]' : 'w-[260px]'
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          headerAction={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          }
        />
      </aside>

      {/* Mobile off-canvas drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 md:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!mobileOpen}
      >
        {/* Overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-black/50 transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setMobileOpen(false)}
        />
        {/* Panel */}
        <aside
          className={cn(
            'absolute left-0 top-0 flex h-full w-[260px] max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar shadow-xl transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <SidebarContent
            collapsed={false}
            onNavigate={() => setMobileOpen(false)}
            headerAction={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            }
          />
        </aside>
      </div>
    </>
  )
}

export function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { profile } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={onMenuClick} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold md:text-lg">
              Welcome back, {profile?.full_name || 'User'}
            </h1>
            <p className="truncate text-xs text-muted-foreground md:text-sm">
              {profile?.role === 'student'
                ? `${profile?.department?.name || 'N/A'} | ${profile?.enrollment_number || 'N/A'}`
                : profile?.role === 'hod'
                  ? `${ROLE_LABELS.hod} | ${profile?.department?.name || 'N/A'}`
                  : profile
                    ? ROLE_LABELS[profile.role]
                    : 'N/A'}
            </p>
          </div>
        </div>
      <div className="flex shrink-0 items-center gap-1 md:gap-3">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications (unread)">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>
      </div>
    </header>
  )
}
