import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { LucideIcon } from '@/components/icons'

type StatTone = 'primary' | 'warning' | 'success' | 'accent'

const toneStyles: Record<StatTone, { icon: string; value: string; glow: string }> = {
  primary: { icon: 'bg-primary/10 text-primary', value: 'text-foreground', glow: 'from-primary/5' },
  warning: { icon: 'bg-warning/10 text-warning', value: 'text-warning', glow: 'from-warning/5' },
  success: { icon: 'bg-success/10 text-success', value: 'text-success', glow: 'from-success/5' },
  accent: { icon: 'bg-accent/10 text-accent', value: 'text-accent', glow: 'from-accent/5' },
}

interface StatCardProps {
  label: string
  value: React.ReactNode
  hint?: string
  icon: LucideIcon
  tone?: StatTone
}

/** Compact KPI tile used across the student and admin dashboards. */
export function StatCard({ label, value, hint, icon: Icon, tone = 'primary' }: StatCardProps) {
  const styles = toneStyles[tone]
  return (
    <Card className="group relative overflow-hidden">
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          styles.glow
        )}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', styles.icon)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-3xl font-bold tabular-nums', styles.value)}>{value}</div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}

/** Loading placeholder that matches StatCard's footprint. */
export function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-9 w-16" />
        <Skeleton className="mt-2 h-3 w-28" />
      </CardContent>
    </Card>
  )
}
