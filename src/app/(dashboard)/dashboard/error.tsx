"use client";

import { RouteError } from "@/components/errors/RouteError";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} homeHref="/" homeLabel="Back to Home" />;
}
