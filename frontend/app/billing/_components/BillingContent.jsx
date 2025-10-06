/**
 * Billing Content Component
 * Handles subscription management UI and interactions
 */

"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Crown, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

const PRICING_PLANS = {
  free: {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Create up to 3 courses",
      "Basic AI content generation",
      "Standard flashcards and quizzes",
      "Community support"
    ],
    limitations: [
      "Limited to 3 courses",
      "Basic AI models only",
      "No priority support"
    ]
  },
  pro: {
    name: "Pro",
    price: "$19",
    period: "month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY,
    features: [
      "Unlimited courses",
      "Advanced AI content generation",
      "Premium flashcards and quizzes",
      "Priority support",
      "Advanced analytics",
      "Export capabilities",
      "Custom study schedules"
    ],
    popular: true
  }
};

export default function BillingContent({ user, success, canceled }) {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (success) {
      toast.success(
        "Subscription activated!",
        "Welcome to AI Learn Pro! You now have access to all premium features."
      );
    }
    if (canceled) {
      toast.info(
        "Checkout canceled",
        "No worries! You can upgrade anytime."
      );
    }
  }, [success, canceled, toast]);

  const handleUpgrade = async (priceId) => {
    if (!priceId) {
      toast.error("Error", "Price ID not configured");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error(
        "Upgrade failed",
        error.message || "Please try again later"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error(data.error || "Failed to open billing portal");
      }
    } catch (error) {
      console.error("Billing portal error:", error);
      toast.error(
        "Unable to open billing portal",
        error.message || "Please try again later"
      );
    } finally {
      setPortalLoading(false);
    }
  };

  const currentPlan = user.isMember ? "pro" : "free";
  const subscriptionStatus = user.subscriptionStatus || "inactive";

  return (
    <div className="space-y-8">
      {/* Current Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Current Subscription
          </h2>
          <div className="flex items-center gap-2">
            {user.isMember ? (
              <>
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                  Pro Member
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                Free Plan
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Plan Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium">{PRICING_PLANS[currentPlan].name}</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">
                  {PRICING_PLANS[currentPlan].price}/{PRICING_PLANS[currentPlan].period}
                </span>
              </div>
              {user.isMember && (
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium capitalize ${
                    subscriptionStatus === "active" 
                      ? "text-green-600" 
                      : subscriptionStatus === "past_due"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}>
                    {subscriptionStatus}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Actions</h3>
            <div className="space-y-2">
              {user.isMember ? (
                <button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  Manage Billing
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(PRICING_PLANS.pro.priceId)}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Crown className="w-4 h-4" />
                  )}
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        </div>

        {subscriptionStatus === "past_due" && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Payment Required</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Your subscription payment is past due. Please update your payment method to continue using Pro features.
            </p>
          </div>
        )}
      </div>

      {/* Pricing Plans */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Available Plans
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(PRICING_PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`relative border rounded-lg p-6 ${
                plan.popular
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              } ${
                currentPlan === key
                  ? "ring-2 ring-green-500 ring-opacity-50"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {currentPlan === key && (
                <div className="absolute -top-3 right-4">
                  <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Current
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="text-3xl font-bold text-gray-900">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-600">
                    /{plan.period}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
                {plan.limitations?.map((limitation, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-500">{limitation}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                {currentPlan === key ? (
                  <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                    Current Plan
                  </div>
                ) : key === "pro" ? (
                  <button
                    onClick={() => handleUpgrade(plan.priceId)}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      "Upgrade Now"
                    )}
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium">
                    Current Plan
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Can I cancel my subscription anytime?
            </h3>
            <p className="text-sm text-gray-600">
              Yes, you can cancel your subscription at any time through the billing portal. 
              You'll continue to have access to Pro features until the end of your billing period.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              What happens to my courses if I downgrade?
            </h3>
            <p className="text-sm text-gray-600">
              Your existing courses will remain accessible, but you'll be limited to creating 
              only 3 courses total on the free plan. You can upgrade again anytime to regain full access.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-sm text-gray-600">
              We offer a 30-day money-back guarantee for new subscriptions. 
              Contact our support team if you're not satisfied with your purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
