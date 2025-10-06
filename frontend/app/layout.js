import "./globals.css";
import { IBM_Plex_Sans, Spline_Sans_Mono } from "next/font/google";

import Provider from "./provider";

export const metadata = {
  title: "AI Learn | AI-Powered LMS SaaS",
  description:
    "Launch adaptive courses powered by AI with automated content, billing, and analytics in minutes.",
};

// Optimize font loading with display swap and preload
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${sans.variable} ${mono.variable}`}>
        <Provider clerkEnabled>
          <div className="relative min-h-screen overflow-hidden bg-background text-foreground antialiased transition-colors duration-500 ease-out">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-6 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2 focus:text-primary-foreground"
            >
              Skip to content
            </a>
            <div className="pointer-events-none fixed inset-0 -z-10" />
            <div className="relative z-10 flex min-h-screen flex-col">
              <main id="main" className="flex-1">
                {children}
              </main>
            </div>
          </div>
        </Provider>
      </body>
    </html>
  );
}
