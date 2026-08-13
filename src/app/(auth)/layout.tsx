import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-gradient shadow-glow-orange">
          <Zap className="h-5 w-5 text-white" fill="currentColor" />
        </span>
        <span className="text-2xl font-extrabold tracking-tight text-navy-800">
          JM <span className="text-gradient-orange">Majiwa</span>
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <Link
        href="/"
        className="mt-8 text-sm font-medium text-gray-500 transition-colors hover:text-orange-600"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
