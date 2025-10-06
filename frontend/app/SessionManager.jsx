"use client";

import { useEffect, useRef } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * SessionManager - Handles session lifecycle
 * 
 * This component ensures users are logged out when they close the browser
 * by checking sessionStorage on mount. If sessionStorage is empty but user
 * is signed in, it means the browser was closed and reopened, so we sign out.
 */
export default function SessionManager() {
  const { isSignedIn, userId } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    const SESSION_KEY = "ai_learn_session_active";

    // Function to check and handle session
    const checkSession = async () => {
      // Only check once on mount
      if (hasCheckedSession.current) return;
      hasCheckedSession.current = true;

      if (isSignedIn) {
        const sessionActive = sessionStorage.getItem(SESSION_KEY);
        
        if (!sessionActive) {
          // Browser was closed and reopened - sign out the user
          console.log("New browser session detected - signing out");
          await signOut();
          router.push('/');
        } else {
          // Session is active - keep it marked
          sessionStorage.setItem(SESSION_KEY, "true");
        }
      }
    };

    // Check session on mount
    checkSession();

    // Mark session as active when user signs in
    if (isSignedIn) {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
  }, [isSignedIn, userId, signOut, router]);

  return null; // This component doesn't render anything
}