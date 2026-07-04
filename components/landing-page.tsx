'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, GraduationCap, Award, TrendingUp, ArrowRight, CheckCircle, Calendar, Upload, Shield, Users, Clock, FileCheck, Building2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { SceneryBackdrop } from '@/components/landing/scenery-backdrop'

const workflow = [
  {
    icon: Users,
    step: '01',
    title: 'Student Registration',
    description: 'Create your account with college credentials and select your department',
    color: 'from-primary to-primary/70',
  },
  {
    icon: BookOpen,
    step: '02',
    title: 'Browse Approved MOOCs',
    description: 'View college-approved NPTEL/SWAYAM courses that map to your curriculum',
    color: 'from-accent to-accent/70',
  },
  {
    icon: Calendar,
    step: '03',
    title: 'Register on NPTEL',
    description: 'Enroll in your chosen course directly on NPTEL portal during the cycle',
    color: 'from-chart-3 to-chart-3/70',
  },
  {
    icon: Upload,
    step: '04',
    title: 'Upload Certificate',
    description: 'When result window opens, upload your certificate for verification',
    color: 'from-success to-success/70',
  },
]

const features = [
  {
    icon: Shield,
    title: 'Automatic Verification',
    description: 'AI-powered certificate validation with manual review for edge cases',
  },
  {
    icon: Calendar,
    title: 'Bi-Annual Cycles',
    description: 'Jan-May and Jul-Dec NPTEL cycles with dedicated upload windows',
  },
  {
    icon: FileCheck,
    title: 'Credit Transfer',
    description: 'Seamless mapping of MOOC credits to your curriculum subjects',
  },
  {
    icon: TrendingUp,
    title: 'Real-time Tracking',
    description: 'Monitor your registration status and verification progress',
  },
]

const stats = [
  { value: '10', label: 'Approved MOOCs', icon: BookOpen },
  { value: '5', label: 'Departments', icon: Building2 },
  { value: '2', label: 'Exam Cycles / Year', icon: Calendar },
  { value: '12 wk', label: 'Course Duration', icon: Clock },
]

const currentCycle = {
  name: 'NPTEL Jul-Dec 2026',
  status: 'Registrations Open',
  deadline: 'Jul 27, 2026',
  resultWindow: 'Oct 17 - 25, 2026',
}

// Official rules from the MOOC Coordinator's notice (No. MOOCS/26/002, 02-07-2026).
const noticeRules = [
  {
    icon: Users,
    title: 'Register with your HoD',
    text: 'Batch 2024 & 2025 must select their MOOC courses for the July–December 2026 session in consultation with their Head of Department.',
  },
  {
    icon: Calendar,
    title: 'Two opportunities only',
    text: 'Each batch has only two opportunities to complete the prescribed MOOC courses — use them wisely.',
  },
  {
    icon: CheckCircle,
    title: 'No re-registration if passed',
    text: 'Students who have already successfully completed the required MOOC course need not register again.',
  },
  {
    icon: Clock,
    title: 'Batch 2023 — last chance',
    text: 'For Batch 2023, this is the final remedial opportunity to complete any pending MOOC requirement.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">GCET MOOC</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Manager</span>
            </div>
          </Link>
          
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#notice" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Notice
            </Link>
            <Link href="#workflow" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </Link>
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#cycles" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Current Cycle
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="shadow-lg shadow-primary/25">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden py-24 md:py-28">
        {/* Motion-graphics scenery */}
        <SceneryBackdrop />

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            {/* Current Cycle Badge */}
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-success/30 bg-success/10 px-5 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              <span className="font-medium text-success">{currentCycle.name}</span>
              <Badge variant="secondary" className="bg-success/20 text-success hover:bg-success/20">
                {currentCycle.status}
              </Badge>
            </div>

            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Transform Your{' '}
              <span className="relative">
                <span className="text-gradient-brand">
                  MOOC Learning
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" aria-hidden="true">
                  <path d="M2 10C50 4 100 4 150 6C200 8 250 4 298 8" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--accent)" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br />Into Credits
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
              The official GCET platform for NPTEL/SWAYAM course registration, certificate verification, 
              and curriculum credit transfer. Simple. Transparent. Efficient.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/sign-up">
                <Button size="lg" className="h-12 gap-2 px-8 text-base shadow-xl shadow-primary/25">
                  Start Registration <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#workflow">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Deadline Notice */}
            <div className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Registration deadline: <strong className="text-foreground">{currentCycle.deadline}</strong></span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              >
                <Card className="card-interactive group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50">
                  <CardContent className="p-6 text-center">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Official Notice / Rules Section */}
      <section id="notice" className="border-t border-border/50 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <Badge variant="outline" className="mb-4 border-warning/40 bg-warning/10 text-warning">
              Important Notice
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">MOOC Registration Rules</h2>
            <p className="text-lg text-muted-foreground">
              Please read carefully before registering for the July–December 2026 session.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {noticeRules.map((rule, index) => (
              <motion.div
                key={rule.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="card-interactive h-full border-border/60">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <rule.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold text-foreground">{rule.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{rule.text}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto mt-8 max-w-4xl text-center text-xs text-muted-foreground"
          >
            Notice No. MOOCS/26/002, dated 02‑07‑2026 · Office of the MOOC Coordinator, GCET Ganderbal ·
            For clarification, contact the MOOCs Coordinator through your department office.
          </motion.p>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="border-t border-border/50 bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <Badge variant="outline" className="mb-4">Simple Process</Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              From registration to credit transfer in four simple steps
            </p>
          </motion.div>

          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {workflow.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                >
                  <Card className="card-interactive group relative h-full overflow-hidden border-border/50 hover:border-primary/50">
                    {/* Step Number Background */}
                    <div className="absolute -right-4 -top-4 text-[120px] font-bold leading-none text-muted/20 transition-colors group-hover:text-primary/10">
                      {item.step}
                    </div>
                    <CardHeader className="relative pb-2">
                      <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-lg`}>
                        <item.icon className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <CardDescription className="text-base leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Connection Line */}
            <div className="mt-8 hidden items-center justify-center lg:flex">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary/40" />
                    <div className="h-0.5 w-24 bg-gradient-to-r from-primary/40 to-primary/20" />
                  </div>
                ))}
                <div className="h-2 w-2 rounded-full bg-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <Badge variant="outline" className="mb-4">Platform Features</Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Everything You Need</h2>
            <p className="text-lg text-muted-foreground">
              Built specifically for GCET&apos;s MOOC credit transfer program
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group h-full border-border/50 transition-all hover:border-primary/50 hover:bg-muted/30">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Cycle Section */}
      <section id="cycles" className="border-t border-border/50 bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="mx-auto max-w-3xl overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardContent className="p-8 md:p-12">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Exam Cycle</p>
                    <h3 className="text-2xl font-bold">{currentCycle.name}</h3>
                  </div>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-background/80 p-4">
                    <p className="mb-1 text-sm text-muted-foreground">Registration Deadline</p>
                    <p className="text-lg font-semibold text-foreground">{currentCycle.deadline}</p>
                  </div>
                  <div className="rounded-xl bg-background/80 p-4">
                    <p className="mb-1 text-sm text-muted-foreground">Result Upload Window</p>
                    <p className="text-lg font-semibold text-foreground">{currentCycle.resultWindow}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/auth/sign-up" className="flex-1">
                    <Button className="w-full gap-2 shadow-lg shadow-primary/25" size="lg">
                      Register Now <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/courses" className="flex-1">
                    <Button variant="outline" className="w-full" size="lg">
                      View Available Courses
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-12 text-center text-primary-foreground shadow-2xl shadow-primary/25"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Ready to Start Your MOOC Journey?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-primary-foreground/80">
                Join hundreds of GCET students who have successfully earned curriculum credits through NPTEL courses.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth/sign-up">
                  <Button size="lg" variant="secondary" className="h-12 gap-2 px-8 text-base">
                    Create Account <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="h-12 border-primary-foreground/50 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold">GCET MOOC Manager</p>
                <p className="text-xs text-muted-foreground">Government College of Engineering &amp; Technology, Ganderbal</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Ganderbal, Kashmir &ndash; 193504
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Terms of Use
              </Link>
              <a href="mailto:aafaq.cse@gcetkashmir.ac.in" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
