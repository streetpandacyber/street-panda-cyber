import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Refund Policy — 30-Day Money Back Guarantee",
  description:
    "Every JM Majiwa purchase is covered by a 30-day money-back guarantee. Not happy? Get a full refund.",
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      updated="2026-07-01"
      intro="We stand behind every product we sell. That's why every purchase on JM Majiwa is protected by our 30-day money-back guarantee — no hoops, no hassle."
    >
      <div className="rounded-3xl bg-neon-50 p-8 text-center">
        <span className="text-5xl">✅</span>
        <h2 className="mt-3 text-2xl font-extrabold text-navy-800">
          30-Day Money Back Guarantee
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-gray-600">
          If a product isn&apos;t what you expected, email us within 30 days of
          purchase and we&apos;ll refund 100% of what you paid.
        </p>
      </div>

      <LegalSection heading="How to request a refund">
        <ol className="list-inside list-decimal space-y-1">
          <li>Email support@jmmajiwa.com with your order number.</li>
          <li>Tell us briefly what didn&apos;t meet expectations.</li>
          <li>
            We process the refund within 3–5 business days, back to your M-Pesa
            or as agreed with support.
          </li>
        </ol>
      </LegalSection>

      <LegalSection heading="What qualifies">
        <p>Any digital purchase within 30 days of the order date qualifies, including:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Products that didn&apos;t match their description</li>
          <li>Technical problems we can&apos;t resolve for you</li>
          <li>Accidental or duplicate purchases</li>
          <li>Simply changing your mind</li>
        </ul>
      </LegalSection>

      <LegalSection heading="A fair note on abuse">
        <p>
          We trust our customers, but we also protect our creators. Refunds may
          be declined where there is clear evidence of abuse — for example,
          repeatedly purchasing, downloading and refunding the same products, or
          redistributing materials before requesting a refund.
        </p>
      </LegalSection>

      <LegalSection heading="Need help?">
        <p>
          Before refunding, consider reaching out — many issues are fixable in
          minutes. Contact{" "}
          <a href="mailto:support@jmmajiwa.com" className="font-semibold text-orange-600">
            support@jmmajiwa.com
          </a>{" "}
          or visit the{" "}
          <Link href="/contact" className="font-semibold text-orange-600">
            contact page
          </Link>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
