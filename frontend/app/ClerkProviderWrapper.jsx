"use client";

import { useUser } from "@clerk/nextjs";
import React, { useCallback, useEffect, useRef, memo } from "react";
import dynamic from "next/dynamic";
import apiClient from "../api-client";

const SessionManager = dynamic(() => import("./SessionManager"), { ssr: false });

function ClerkProviderWrapper({ children, suppressDuringSSR = false }) {
  const { user } = useUser();
  const hasCheckedUser = useRef(false);

  const checkIsNewUser = useCallback(async () => {
    if (!user || hasCheckedUser.current) return;
    hasCheckedUser.current = true;

    try {
      const payload = {
        externalId: user.id,
        name: user.fullName,
        email: user.primaryEmailAddress?.emailAddress,
      };

      const response = await apiClient.post("/api/create-user", payload);
      if (process.env.NODE_ENV === "development") {
        console.log("User check response:", response.data);
      }
    } catch (error) {
      console.error(
        "Failed to create/check user:",
        error.response?.data || error.message
      );
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkIsNewUser();
    }
  }, [user, checkIsNewUser]);

  if (suppressDuringSSR && typeof window === "undefined") {
    return <>{children}</>;
  }

  return (
    <>
      <SessionManager />
      {children}
    </>
  );
}

export default memo(ClerkProviderWrapper);
