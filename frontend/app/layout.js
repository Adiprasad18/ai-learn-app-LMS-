import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { IBM_Plex_Sans, Spline_Sans_Mono } from "next/font/google";
import { Suspense } from "react";

// Fonts setup
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const mono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "AI Learn | AI-Powered LMS SaaS",
  description:
    "Launch adaptive courses powered by AI with automated content, billing, and analytics in minutes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${sans.variable} ${mono.variable}`}>
        {/* ? Wrap the entire app in ClerkProvider */}
        <ClerkProvider>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            {children}
          </Suspense>
        </ClerkProvider>
      </body>
    </html>
  );
}
