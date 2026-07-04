import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MailCheck } from '@/components/icons'
import { AuthShell } from '@/components/auth/auth-shell'

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      title="Check Your Email"
      icon={
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-accent/20">
          <MailCheck className="h-8 w-8 text-accent" />
        </div>
      }
      description="We've sent a confirmation link to your email address. Please click the link to verify your account."
    >
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or try signing up again.
        </p>
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">Go to Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  )
}
