import Link from "next/link";
import { RefreshCw } from "lucide-react";

export function StoreUnavailable() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center bg-gray-50 px-4 py-20 text-center">
      <span className="text-5xl">🛠️</span>
      <h1 className="mt-5 text-2xl font-extrabold text-navy-800">
        We&apos;re updating the store
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
        The live catalog is temporarily unavailable while we finish a secure
        update. Please try again shortly or contact support if you need help.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Link>
        <Link href="/contact" className="btn-secondary">
          Contact Support
        </Link>
      </div>
    </div>
  );
}
