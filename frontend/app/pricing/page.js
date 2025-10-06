import Link from "next/link";
import { Check, ArrowRight, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Everything you need to create amazing courses",
    features: [
      "Unlimited course generations",
      "AI-powered course creation",
      "Interactive flashcards & quizzes",
      "Progress tracking & analytics",
      "Real-time collaboration",
      "Community support",
    ],
    buttonText: "Get Started Free",
    buttonVariant: "default",
    href: "/sign-up",
    popular: true,
  },
  {
    name: "Pro",
    price: "Coming Soon",
    description: "Advanced features for power users",
    features: [
      "Everything in Free",
      "Advanced AI customization",
      "Custom branding & themes",
      "Team collaboration tools",
      "Priority support",
      "API access",
    ],
    buttonText: "Join Waitlist",
    buttonVariant: "outline",
    href: "/contact",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations and institutions",
    features: [
      "Everything in Pro",
      "White-label solution",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "On-premise deployment",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    href: "/contact",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-700 border border-primary/20 mb-6">
            <Zap className="h-4 w-4" />
            Pricing Plans
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Free</span> Forever
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Start creating unlimited AI-powered courses today. No credit card required, no hidden fees, no limits.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/60 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up ${
                plan.popular
                  ? 'ring-2 ring-primary/20 shadow-primary/10 hover:shadow-primary/20'
                  : 'hover:shadow-medium'
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {plan.popular && (
                <>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary to-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-soft">
                      <Sparkles className="inline h-4 w-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
                <div className="mt-6">
                  <span className="text-5xl font-bold gradient-text">{plan.price}</span>
                  {plan.price === "$0" && <span className="text-neutral-600 text-lg">/forever</span>}
                  {plan.price === "Coming Soon" && <span className="text-neutral-600 text-lg block mt-1">Coming Soon</span>}
                  {plan.price === "Custom" && <span className="text-neutral-600 text-lg block mt-1">Contact Us</span>}
                </div>
                <CardDescription className="mt-4 text-base leading-relaxed">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  className={`w-full h-12 text-base font-semibold transition-all duration-200 ${
                    plan.buttonVariant === "default"
                      ? "bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-soft hover:shadow-medium group/btn"
                      : "border-2 hover:bg-accent/5 hover:border-accent/30"
                  }`}
                  variant={plan.buttonVariant}
                  asChild
                >
                  <Link href={plan.href}>
                    {plan.buttonText}
                    {plan.buttonVariant === "default" && <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-20 animate-fade-in-up animation-delay-600">
          <p className="text-neutral-600 mb-6 text-lg">
            Have questions? <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors duration-200">Contact our team</Link>
          </p>
          <Button variant="ghost" className="hover:bg-white/60 transition-colors duration-200" asChild>
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
