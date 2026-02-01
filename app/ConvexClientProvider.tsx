'use client';

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { CONVEX_URL, isConvexConfigured } from "@/lib/config";

// Create the Convex client only if configured
const convex = isConvexConfigured() ? new ConvexReactClient(CONVEX_URL) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // If Convex is not configured, just render children without the provider
  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
