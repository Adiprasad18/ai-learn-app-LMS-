'use client'

import SiteHeader from "@/components/layout/site-header"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, BarChart3, Clock, ShieldCheck } from "lucide-react"

import Container from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import FeaturePill from "@/components/landing/feature-pill"
import {
  HeroMediaMotion,
  HeroMotionContainer,
  HeroMotionItem,
  FloatingPillMotion,
} from "@/components/landing/hero-animations"
import { heroVariants } from "@/lib/motion/variants"

const heroStagger = 0.12

const infoHighlights = [
  {
    title: "Personalized AI Courses",
    description: "Describe your goals once and let AI adapt every lesson to your learners.",
    icon: Sparkles,
  },
  {
    title: "Track Your Progress",
    description: "Monitor completions, quiz scores, and momentum from a single dashboard.",
    icon: BarChart3,
  },
  {
    title: "Upgrade Anytime",
    description: "Scale with Stripe-powered billing when you’re ready for more seats.",
    icon: Clock,
  },
]

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Docs", href: "/docs" },
  { label: "GitHub", href: "https://github.com" },
  { label: "Discord", href: "https://discord.gg" },
  { label: "Privacy Policy", href: "/privacy" },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Container
          as="section"
          size="wide"
          className="relative grid gap-16 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
        >
          <HeroMotionContainer delay={0.05} className="space-y-8">
            <HeroMotionItem delay={0.1} className="badge-pill border border-primary/20 bg-primary/10 dark:bg-primary/20 text-primary">
              ✨ AI-Powered LMS Platform
            </HeroMotionItem>
            <HeroMotionItem delay={0.1 + heroStagger}>
              <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
                Learn Smarter with <span className="gradient-text">AI</span>
              </h1>
            </HeroMotionItem>
            <HeroMotionItem delay={0.1 + heroStagger * 2}>
              <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
                Generate personalized courses, comprehensive notes, interactive flashcards, and challenging quizzes instantly. AI Learn automates the busywork so you can focus on what matters most.
              </p>
            </HeroMotionItem>
            <HeroMotionItem
              delay={0.1 + heroStagger * 3}
              className="flex flex-wrap items-center gap-4"
            >
              <Button className="group h-12 rounded-lg bg-primary hover:bg-primary/90 px-8 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-200" asChild>
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="h-12 rounded-lg border border-border px-8 text-base text-foreground hover:bg-muted dark:hover:bg-muted"
                asChild
              >
                <Link href="/demo">View Demo</Link>
              </Button>
            </HeroMotionItem>
            <HeroMotionItem
              delay={0.1 + heroStagger * 4}
              className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
            >
              <FeaturePill
                icon={<Sparkles className="h-4 w-4 text-primary" />}
                label="AI-generated content"
                delay={0}
              />
              <FeaturePill
                icon={<ShieldCheck className="h-4 w-4 text-primary" />}
                label="Secure authentication"
                delay={0.12}
              />
              <FeaturePill
                icon={<BarChart3 className="h-4 w-4 text-primary" />}
                label="Real-time analytics"
                delay={0.24}
              />
            </HeroMotionItem>
          </HeroMotionContainer>

          <HeroMediaMotion delay={0.2} className="relative">
            <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              <CardHeader className="border-b border-border bg-muted/30" />
              <CardContent className="p-0">
                <Image
                  src="/content.png"
                  alt="Dashboard preview"
                  width={720}
                  height={520}
                  className="h-full w-full object-cover"
                  priority
                />
              </CardContent>
            </Card>
            <FloatingPillMotion className="floating-pill absolute -bottom-10 left-1/2 w-[78%] -translate-x-1/2 rounded-xl border border-border bg-card p-5 shadow-lg">
              <p className="text-sm font-semibold text-foreground">
                Welcome back, Alex • 92% weekly completion
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Learners finished 42 lessons this week. Automations sent two reminders and published the next module.
              </p>
            </FloatingPillMotion>
          </HeroMediaMotion>
        </Container>

        <Container
          as="section"
          className="relative mb-20 rounded-xl border border-border bg-card px-8 py-14 shadow-sm"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center lg:flex-row lg:text-left"
          >
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-bold md:text-4xl gradient-text">
                Everything you need to learn faster, powered by AI
              </h2>
              <p className="text-muted-foreground">
                Preview your personalized dashboard, unlock automated course builders, and guide every learner with adaptive content.
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <Button className="rounded-lg px-6 h-12" asChild>
                <Link href="/sign-up">
                  Sign Up to Unlock Features <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </Container>

        <Container as="section" className="grid gap-6 pb-16 md:grid-cols-3">
          {infoHighlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ delay: index * 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="group h-full border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
                <CardHeader className="flex flex-col gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground">{item.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </Container>

        <Container
          as="section"
          className="relative rounded-xl bg-primary px-8 py-16 text-primary-foreground shadow-lg"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl">
              Start your AI learning journey today!
            </h2>
            <p className="max-w-2xl text-base opacity-90">
              Sign up in minutes, connect Stripe subscriptions, and watch AI keep learners engaged auto-magically.
            </p>
            <Button className="h-12 rounded-lg bg-background px-10 text-base font-semibold text-foreground shadow-md hover:bg-background/90" asChild>
              <Link href="/sign-up">Get Started Now</Link>
            </Button>
          </motion.div>
        </Container>
      </main>

      <footer className="border-t border-border bg-background">
        <Container className="flex flex-col gap-10 py-10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
              <Image src="/logo.svg" alt="AI Learn logo" width={28} height={28} style={{ height: "auto" }} />
              <span>AI Learn</span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              Build adaptive learning experiences that convert better, retain longer, and scale automatically.
            </p>
          </div>
          <div className="flex flex-col gap-6 text-sm text-muted-foreground md:flex-row md:items-center md:gap-10">
            <nav className="flex flex-wrap gap-4">
              {footerLinks.map((link) => (
                <Link key={link.label} href={link.href} className="transition hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Link href="https://discord.gg" className="transition hover:text-foreground">
                <Image src="/globe.svg" alt="Discord" width={20} height={20} />
              </Link>
              <Link href="https://instagram.com" className="transition hover:text-foreground">
                <Image src="/instagram.svg" alt="Instagram" width={20} height={20} />
              </Link>
              <Link href="https://github.com" className="transition hover:text-foreground">
                <Image src="/github.svg" alt="GitHub" width={20} height={20} />
              </Link>
            </div>
          </div>
        </Container>
        <div className="border-t border-white/40 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AI Learn. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
