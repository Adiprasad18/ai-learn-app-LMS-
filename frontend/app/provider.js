"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import ClerkProviderWrapper from "./ClerkProviderWrapper";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "next-themes";

/**
 * Provider - client wrapper for optional Clerk integration
 *
 * Props:
 *  - children: ReactNode
 *  - clerkEnabled: boolean (if false, returns children directly)
 *  - publishableKey: string (preferred, passed from layout). If omitted,
 *                    falls back to process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.
 */
export default function Provider({ children, clerkEnabled = false, publishableKey }) {
  // Prefer key passed from layout (server) for reliability
  const key = publishableKey ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const withThemeAndToasts = (content) => (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="ai-learn-theme"
    >
      <ToastProvider>{content}</ToastProvider>
    </ThemeProvider>
  );

  if (!clerkEnabled || !key) {
    if (!key && process.env.NODE_ENV === "development") {
      console.warn("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined. ClerkProvider will not be mounted.");
    }
    return withThemeAndToasts(children);
  }

  return (
    <ClerkProvider
      publishableKey={key}
      // Configure appearance
      appearance={{ elements: { formButtonPrimary: "bg-primary" } }}
    >
      <ClerkProviderWrapper>{withThemeAndToasts(children)}</ClerkProviderWrapper>
    </ClerkProvider>
  );
}
