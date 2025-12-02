"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      height="4px"
      color="#efb100"
      options={{ showSpinner: false }}
      shallowRouting
    >
      <NuqsAdapter>{children}</NuqsAdapter>
    </ProgressProvider>
  );
}
