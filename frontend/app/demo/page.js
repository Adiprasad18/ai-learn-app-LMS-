import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Play, Sparkles, BookOpen, BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
        <div className="mb-12 animate-slide-up">
          <Button variant="ghost" className="mb-6 hover:bg-white/60 transition-colors duration-200" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-700 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4" />
            Interactive Demo
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Experience <span className="gradient-text">AI Learn</span> in Action
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl leading-relaxed">
            See how our AI-powered platform transforms the way you create and manage educational content
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-neutral-200/60 p-8 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <BookOpen className="h-6 w-6 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Course Creation</h2>
                </div>
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  Describe your topic and let AI generate a complete course structure with lessons, quizzes, and flashcards in minutes.
                </p>
                <Button className="group/btn bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-soft hover:shadow-medium transition-all duration-200" asChild>
                  <Link href="/create">
                    Try Course Creation
                    <Play className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-neutral-200/60 p-8 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up animation-delay-200">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-accent/10 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-accent-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                </div>
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  Track progress, manage courses, and monitor learner engagement from your personalized dashboard with real-time analytics.
                </p>
                <Button variant="outline" className="border-2 hover:bg-accent/5 hover:border-accent/30 transition-all duration-200" asChild>
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/60 backdrop-blur-sm shadow-soft animate-fade-in-up animation-delay-400">
              <Image
                src="/content.png"
                alt="Dashboard preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-600 to-accent p-8 text-white shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up animation-delay-600">
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-white/90 mb-6 leading-relaxed">
                  Sign up now and create your first AI-powered course for free. No credit card required.
                </p>
                <Button variant="secondary" className="bg-white text-primary-700 hover:bg-white/90 shadow-soft hover:shadow-medium transition-all duration-200" asChild>
                  <Link href="/sign-up">Sign Up Free</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
