import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from '@/components/icons'
import { AuthShell } from '@/components/auth/auth-shell'

export default function AuthErrorPage() {
  return (
    <AuthShell
      title="Something Went Wrong"
      icon={
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
      }
      description="We couldn't confirm your sign-in or reset link. It may have expired or already been used."
    >
      <Button asChild className="w-full">
        <Link href="/auth/login">Back to Sign In</Link>
      </Button>
    </AuthShell>
  )
}
