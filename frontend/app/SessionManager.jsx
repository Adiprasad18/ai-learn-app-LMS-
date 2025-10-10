"use client";

import { useEffect, useRef } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * SessionManager - Handles session lifecycle
 *
 * This component should only execute in the browser.
 */
export default function SessionManager() {
  const { isSignedIn, userId } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const SESSION_KEY = "ai_learn_session_active";

    const checkSession = async () => {
      if (hasCheckedSession.current) return;
      hasCheckedSession.current = true;

      if (isSignedIn) {
        const sessionActive = window.sessionStorage.getItem(SESSION_KEY);

        if (!sessionActive) {
          console.log("New browser session detected - signing out");
          await signOut();
          router.push("/");
        } else {
          window.sessionStorage.setItem(SESSION_KEY, "true");
        }
      }
    };

    checkSession();

    if (isSignedIn) {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    }
  }, [isSignedIn, userId, signOut, router]);

  return null;
}