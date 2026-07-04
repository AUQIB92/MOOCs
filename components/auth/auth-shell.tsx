import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, AlertCircle, CheckCircle } from '@/components/icons'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

/**
 * Accessible inline feedback for auth forms. Uses role="alert" so screen
 * readers announce validation/errors and confirmations as they appear.
 */
export function AuthAlert({
  variant = 'error',
  children,
}: {
  variant?: 'error' | 'success'
  children: React.ReactNode
}) {
  const Icon = variant === 'success' ? CheckCircle : AlertCircle
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2 rounded-lg border p-3 text-sm',
        variant === 'success'
          ? 'border-success/40 bg-success/10 text-success'
          : 'border-destructive/50 bg-destructive/10 text-destructive'
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

interface AuthShellProps {
  title: string
  description?: React.ReactNode
  /** Optional status icon shown above the title (e.g. success / error state). */
  icon?: React.ReactNode
  /** Card body — form fields, buttons, etc. */
  children: React.ReactNode
  /** Optional footer row below the card body (e.g. "Already have an account?"). */
  footer?: React.ReactNode
  /** Widen the card for multi-field forms like sign-up. */
  wide?: boolean
}

/**
 * Shared, branded chrome for every /auth page: ambient gradient backdrop,
 * college wordmark, a theme toggle, and a consistently styled card. Keeps the
 * auth flow visually coherent and removes the layout duplication that used to
 * live in each page.
 */
export function AuthShell({ title, description, icon, children, footer, wide }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 py-12">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" />
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-primary/15 blur-[110px]" />
        <div className="absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-accent/15 blur-[110px]" />
      </div>

      {/* Theme toggle */}
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full" style={{ maxWidth: wide ? '30rem' : '26rem' }}>
        {/* Brand */}
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">GCET MOOC</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Manager</span>
          </div>
        </Link>

        <Card className="animate-fade-in-up border-border/60 shadow-soft-lg backdrop-blur-sm">
          <CardHeader className="text-center">
            {icon && <div className="mx-auto mb-2">{icon}</div>}
            <CardTitle className="text-2xl">{title}</CardTitle>
            {description && (
              <CardDescription className={cn(icon && 'text-base')}>{description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {children}
            {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
