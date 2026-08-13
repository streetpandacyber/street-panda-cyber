import Link from "next/link";
import type { Metadata } from "next";
import { MailCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Check Your Email",
  description: "Confirm your email address to activate your JM Majiwa account.",
};

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  return (
    <div className="card-premium !rounded-3xl p-10 text-center">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neon-50">
        <MailCheck className="h-10 w-10 text-neon-600" />
      </span>
      <h1 className="mt-6 text-2xl font-extrabold text-navy-800">
        Check your email 📬
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
        We sent a confirmation link to{" "}
        <strong className="text-navy-800">
          {searchParams.email ?? "your email address"}
        </strong>
        . Click it to activate your account, then sign in to access your
        downloads.
      </p>
      <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-left text-xs text-gray-500">
        <p className="font-bold text-navy-800">No email after 2 minutes?</p>
        <ul className="mt-1.5 list-inside list-disc space-y-1">
          <li>Check your spam/junk folder</li>
          <li>Make sure the address was typed correctly</li>
          <li>
            Still stuck? Email streetpandacyber@gmail.com or WhatsApp +254 745
            198 099
          </li>
        </ul>
      </div>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/login" className="btn-primary">
          Go to Sign In
        </Link>
        <Link href="/marketplace" className="btn-secondary">
          Keep Browsing
        </Link>
      </div>
    </div>
  );
}
