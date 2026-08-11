import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How JM Majiwa collects, uses and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="2026-07-01"
      intro="Your privacy matters to us. This policy explains what data JM Majiwa collects, why we collect it, and how we protect it. By using our site you agree to this policy."
    >
      <LegalSection heading="1. Information We Collect">
        <p>
          <strong>Account data:</strong> name, email address, phone number and
          profile details you provide when registering or checking out.
        </p>
        <p>
          <strong>Order data:</strong> purchase history, order numbers and the
          M-Pesa phone number used for payment. We never see or store your M-Pesa
          PIN — payments are processed entirely by Safaricom&apos;s Daraja API.
        </p>
        <p>
          <strong>Usage data:</strong> pages visited, products viewed and device
          information, collected anonymously to improve the store.
        </p>
      </LegalSection>

      <LegalSection heading="2. How We Use Your Data">
        <p>We use your data to:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Process orders and deliver your downloads</li>
          <li>Send order confirmations and download links by email</li>
          <li>Provide customer support</li>
          <li>Send the newsletter — only if you subscribed</li>
          <li>Improve our products and website experience</li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Data Sharing">
        <p>
          We never sell your personal data. We share data only with services
          required to run the store: Supabase (secure hosting of your account
          and orders), Safaricom Daraja (payment processing), and Resend
          (transactional email). Each provider is bound by its own data
          protection obligations.
        </p>
      </LegalSection>

      <LegalSection heading="4. Data Security">
        <p>
          All traffic is encrypted with TLS/SSL. Database access is protected by
          row-level security policies, and payment callbacks are verified
          server-side. Download links use expiring, signed URLs.
        </p>
      </LegalSection>

      <LegalSection heading="5. Your Rights">
        <p>
          You may request access to, correction of, or deletion of your personal
          data at any time by emailing{" "}
          <a href="mailto:support@jmmajiwa.com" className="font-semibold text-orange-600">
            support@jmmajiwa.com
          </a>
          . Newsletter emails include a one-click unsubscribe link.
        </p>
      </LegalSection>

      <LegalSection heading="6. Cookies">
        <p>
          We use essential cookies for authentication and local storage for your
          cart and wishlist. Analytics cookies are anonymous and used only to
          understand how the store performs.
        </p>
      </LegalSection>

      <LegalSection heading="7. Changes to This Policy">
        <p>
          We may update this policy as the service grows. Material changes will
          be announced on this page with a new &quot;last updated&quot; date.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
