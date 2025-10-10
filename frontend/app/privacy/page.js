import Link from "next/link";
import { ArrowLeft, Shield, FileText, Mail, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-neutral-900">
      <div className="mx-auto max-w-5xl px-6 py-20 md:px-10 lg:px-12">
        <div className="mb-12 animate-slide-up">
          <Button variant="ghost" className="mb-6 hover:bg-white/60 transition-colors duration-200" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-700 border border-primary/20 mb-6">
            <Shield className="h-4 w-4" />
            Privacy Policy
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Your Privacy <span className="gradient-text">Matters</span>
          </h1>
          <p className="text-xl text-neutral-600 leading-relaxed">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-12">
          <section className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/60 rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary-600" />
                Information We Collect
              </h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                We collect information you provide directly to us, such as when you create an account,
                use our services, or contact us for support.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">Account information (name, email, password)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">Course content you create</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">Usage data and analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">Payment information (processed securely by Stripe)</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/60 rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up animation-delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Shield className="h-8 w-8 text-accent-600" />
                How We Use Your Information
              </h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">We use the information we collect to:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">Provide, maintain, and improve our services</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">Process transactions and manage your account</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">Send you technical notices and support messages</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">Communicate with you about products and services</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">Monitor and analyze usage patterns</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/60 rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up animation-delay-400">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-600" />
                Information Sharing
              </h2>
              <div className="space-y-6 text-lg leading-relaxed text-neutral-600">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties
                  without your consent, except as described in this policy.
                </p>
                <p>We may share your information in the following circumstances:</p>
              </div>
              <ul className="space-y-3 mt-6">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">With service providers who assist our operations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">To comply with legal obligations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">To protect our rights and prevent fraud</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/60 rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up animation-delay-600">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary-600" />
                Data Security
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed">
                We implement appropriate security measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>
          </section>

          <section className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/60 rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up animation-delay-800">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <FileText className="h-8 w-8 text-accent-600" />
                Your Rights
              </h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">You have the right to:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">Access and update your personal information</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">Request deletion of your data</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">Opt out of marketing communications</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-700">Data portability</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/60 rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up animation-delay-900">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Mail className="h-8 w-8 text-accent-600" />
                Contact Us
              </h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">Email</p>
                    <p className="text-neutral-600">privacy@ai-learn.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">Address</p>
                    <p className="text-neutral-600">[Your Business Address]</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
