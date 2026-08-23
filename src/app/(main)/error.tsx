"use client";

import { RouteError } from "@/components/errors/RouteError";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-gray-50">
      <RouteError
        error={error}
        reset={reset}
        homeHref="/"
        homeLabel="Back to Home"
      />
    </div>
  );
}
