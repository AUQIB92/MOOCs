import { cn } from '@/lib/utils'
import type { LucideIcon } from '@/components/icons'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  /** Right-aligned actions (buttons, filters). Wraps below title on mobile. */
  actions?: React.ReactNode
  /** Optional content rendered under the description (e.g. badges). */
  children?: React.ReactNode
  className?: string
}

/**
 * Consistent page heading used across dashboard pages: optional accent icon,
 * title + description, and a slot for right-aligned actions.
 */
export function PageHeader({ title, description, icon: Icon, actions, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
          {children}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
