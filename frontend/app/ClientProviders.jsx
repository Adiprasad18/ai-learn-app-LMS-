"use client";

import React from "react";

/**
 * ClientProviders - all client-only providers have been removed to unblock SSR.
 */
export default function ClientProviders({ children }) {
  return <>{children}</>;
}