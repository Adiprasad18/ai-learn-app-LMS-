import React from "react";
import ClientProviders from "./ClientProviders";

/**
 * Provider - wraps app children with client-only providers safely during SSR.
 */
export default function Provider({ children }) {
  return <ClientProviders>{children}</ClientProviders>;
}