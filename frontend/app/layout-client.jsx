"use client";

import { Suspense } from "react";
import { IBM_Plex_Sans, Spline_Sans_Mono } from "next/font/google";
// import RootProviders from "./root-providers"; // keep disabled for now

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

export default function LayoutClient({ children }) {
  return (
    <div className={`${sans.variable} ${mono.variable}`}>
      {/* <RootProviders> */}
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        {children}
      </Suspense>
      {/* </RootProviders> */}
    </div>
  );
}
