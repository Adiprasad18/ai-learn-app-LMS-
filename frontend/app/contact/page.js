import Link from "next/link";
import { Mail, MessageSquare, Phone, MapPin, Send, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "Send us an email",
    contact: "support@ai-learn.com",
    action: "mailto:support@ai-learn.com",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our support team",
    contact: "Available 24/7",
    action: "#",
  },
  {
    icon: Phone,
    title: "Phone",
    description: "Call us directly",
    contact: "+1 (555) 123-4567",
    action: "tel:+15551234567",
  },
  {
    icon: MapPin,
    title: "Office",
    description: "Visit our office",
    contact: "123 AI Street, Tech City, TC 12345",
    action: "#",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-700 border border-primary/20 mb-6">
            <Users className="h-4 w-4" />
            Get In Touch
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            We&apos;d Love to Hear from <span className="gradient-text">You</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Have questions about AI Learn? We&apos;re here to help. Get in touch with our team
            and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-20">
          {contactMethods.map((method, index) => (
            <Card key={method.title} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/60 shadow-soft hover:shadow-medium transition-all duration-300 text-center animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="pb-4">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                  <method.icon className="h-8 w-8 text-primary-600" />
                </div>
                <CardTitle className="text-xl font-bold">{method.title}</CardTitle>
                <CardDescription className="text-base">{method.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-semibold text-neutral-900 mb-6 text-lg">{method.contact}</p>
                {method.action.startsWith('mailto:') || method.action.startsWith('tel:') ? (
                  <Button asChild className="w-full h-12 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-soft hover:shadow-medium transition-all duration-200 group/btn">
                    <a href={method.action}>
                      Contact
                      <Send className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </a>
                  </Button>
                ) : (
                  <Button className="w-full h-12 border-2 border-neutral-300 text-neutral-500 cursor-not-allowed" disabled>
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-2xl mx-auto animate-fade-in-up animation-delay-600">
          <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/60 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative pb-6">
              <CardTitle className="text-2xl font-bold">Send us a message</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Fill out the form below and we&apos;ll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-300 transition-all duration-200 bg-white/60"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-300 transition-all duration-200 bg-white/60"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-300 transition-all duration-200 bg-white/60"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Subject</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-300 transition-all duration-200 bg-white/60"
                  placeholder="How can we help?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-300 transition-all duration-200 bg-white/60 resize-none"
                  placeholder="Tell us more about your question..."
                />
              </div>
              <Button className="w-full h-12 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-soft hover:shadow-medium transition-all duration-200 group">
                <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-20 animate-fade-in-up animation-delay-800">
          <Button variant="ghost" className="hover:bg-white/60 transition-colors duration-200" asChild>
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
