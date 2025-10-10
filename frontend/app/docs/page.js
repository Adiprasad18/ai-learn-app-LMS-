import Link from "next/link";
import { ArrowRight, BookOpen, Code, Zap, FileText, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const docSections = [
  {
    title: "Getting Started",
    description: "Learn the basics of AI Learn",
    icon: BookOpen,
    items: [
      { title: "Quick Start Guide", href: "/docs/quick-start" },
      { title: "Creating Your First Course", href: "/docs/first-course" },
      { title: "Dashboard Overview", href: "/docs/dashboard" },
    ],
  },
  {
    title: "Features",
    description: "Explore AI Learn capabilities",
    icon: Zap,
    items: [
      { title: "AI Course Generation", href: "/docs/ai-generation" },
      { title: "Progress Tracking", href: "/docs/progress" },
      { title: "Quiz & Flashcards", href: "/docs/assessments" },
    ],
  },
  {
    title: "API & Integration",
    description: "Technical documentation",
    icon: Code,
    items: [
      { title: "API Reference", href: "/docs/api" },
      { title: "Webhooks", href: "/docs/webhooks" },
      { title: "SDKs", href: "/docs/sdks" },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-700 border border-primary/20 mb-6">
            <FileText className="h-4 w-4" />
            Documentation
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Developer <span className="gradient-text">Documentation</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about building amazing learning experiences with AI Learn.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-20">
          {docSections.map((section, index) => (
            <Card key={section.title} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/60 shadow-soft hover:shadow-medium transition-all duration-300 h-full animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="pb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <section.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">{section.title}</CardTitle>
                    <CardDescription className="text-base">{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className="group/link flex items-center justify-between p-4 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-200"
                      >
                        <span className="font-medium text-neutral-700 group-hover/link:text-primary-700">{item.title}</span>
                        <ArrowRight className="h-4 w-4 text-neutral-400 group-hover/link:text-primary-600 group-hover/link:translate-x-1 transition-all duration-200" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center animate-fade-in-up animation-delay-600">
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/60 rounded-3xl p-12 mb-12 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-6">Need Help?</h2>
              <p className="text-neutral-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-soft hover:shadow-medium transition-all duration-200 group" asChild>
                  <Link href="/contact">
                    Contact Support
                    <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </Button>
                <Button variant="outline" className="border-2 hover:bg-accent/5 hover:border-accent/30 transition-all duration-200" asChild>
                  <Link href="https://discord.gg">Join Community</Link>
                </Button>
              </div>
            </div>
          </div>

          <Button variant="ghost" className="hover:bg-white/60 transition-colors duration-200" asChild>
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
