import Link from "next/link";
import { SearchNotFound } from "@/components/SearchNotFound";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-20 text-center">
      <p className="text-8xl font-extrabold tracking-tight text-navy-800 md:text-9xl">
        4<span className="text-gradient-orange">0</span>4
      </p>
      <h1 className="mt-4 text-2xl font-extrabold text-navy-800 md:text-3xl">
        Oops — this page took a wrong turn
      </h1>
      <p className="mt-3 max-w-md text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Try
        searching below, or jump back to a popular spot.
      </p>

      <div className="mt-8 w-full max-w-md">
        <SearchNotFound />
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {[
          { label: "🏠 Home", href: "/" },
          { label: "🛍️ Marketplace", href: "/marketplace" },
          { label: "🎁 Bundles", href: "/bundles" },
          { label: "📖 Learning Hub", href: "/learning-hub" },
          { label: "💬 Contact", href: "/contact" },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="badge-navy !px-4 !py-2 transition-colors hover:bg-navy-200">
            {link.label}
          </Link>
        ))}
      </div>

      <Link href="/" className="btn-primary mt-10">
        ← Back to Home
      </Link>
    </div>
  );
}
