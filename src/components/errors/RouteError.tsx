"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref?: string;
  homeLabel?: string;
}

export function RouteError({
  error,
  reset,
  homeHref = "/",
  homeLabel = "Back to Home",
}: RouteErrorProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="text-5xl">😵</span>
      <h2 className="mt-4 text-2xl font-extrabold text-navy-800">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-gray-400">Error ID: {error.digest}</p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-primary">
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
        <Link href={homeHref} className="btn-secondary">
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
