import Image from "next/image";
import Link from "next/link";
import { Users, Target, Heart, Sparkles, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const values = [
  {
    icon: Users,
    title: "Accessibility",
    description: "Making quality education accessible to everyone through AI-powered learning tools.",
  },
  {
    icon: Target,
    title: "Innovation",
    description: "Pushing the boundaries of what's possible in online education with cutting-edge AI.",
  },
  {
    icon: Heart,
    title: "Impact",
    description: "Creating meaningful learning experiences that transform lives and careers.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-700 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4" />
            About Us
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            About <span className="gradient-text">AI Learn</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            We&apos;re on a mission to democratize education by making it easier for anyone to create,
            share, and learn from high-quality courses powered by artificial intelligence.
          </p>
        </div>

        <div className="grid gap-16 lg:grid-cols-2 items-center mb-20 animate-fade-in-up">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold tracking-tight">Our Story</h2>
            <div className="space-y-6 text-lg leading-relaxed text-neutral-600">
              <p>
                Founded in 2024, AI Learn was born from the frustration of educators spending countless
                hours creating course content. We saw an opportunity to use AI to automate the tedious
                parts of course creation while preserving the creativity and expertise of teachers.
              </p>
              <p>
                Today, we&apos;re helping thousands of educators, trainers, and organizations create engaging
                learning experiences that adapt to each student&apos;s needs and pace.
              </p>
            </div>
          </div>
          <div className="relative animate-fade-in-up animation-delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-30"></div>
            <div className="relative">
              <Image
                src="/laptop.png"
                alt="AI Learn team"
                width={500}
                height={400}
                className="rounded-3xl shadow-soft"
                priority
              />
            </div>
          </div>
        </div>

        <div className="mb-20 animate-fade-in-up animation-delay-400">
          <h2 className="text-4xl font-bold tracking-tight text-center mb-16">Our Values</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value, index) => (
              <div key={value.title} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/60 rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 text-center animate-fade-in-up" style={{ animationDelay: `${600 + index * 200}ms` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 mb-6">
                    <value.icon className="h-10 w-10 text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center animate-fade-in-up animation-delay-800">
          <div className="group relative overflow-hidden bg-gradient-to-r from-primary via-primary-600 to-accent rounded-3xl p-12 mb-12 text-white shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                Whether you&apos;re an educator, student, or organization, there&apos;s a place for you in the AI Learn community.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="secondary" className="bg-white text-primary-700 hover:bg-white/90 shadow-soft hover:shadow-medium transition-all duration-200 group/btn" asChild>
                  <Link href="/sign-up">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Link>
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 transition-all duration-200" asChild>
                  <Link href="/contact">Contact Us</Link>
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
