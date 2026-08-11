import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions for using the JM Majiwa marketplace.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="2026-07-01"
      intro="These terms govern your use of the JM Majiwa marketplace. By creating an account or purchasing a product you agree to them."
    >
      <LegalSection heading="1. The Service">
        <p>
          JM Majiwa sells digital products — prompt packs, templates, eBooks,
          study materials and bundles — delivered electronically immediately
          after payment.
        </p>
      </LegalSection>

      <LegalSection heading="2. Accounts">
        <p>
          You are responsible for keeping your account credentials secure and
          for all activity under your account. Provide accurate information at
          registration and checkout; incorrect emails can prevent delivery.
        </p>
      </LegalSection>

      <LegalSection heading="3. Purchases & Payments">
        <p>
          All prices are in Kenyan Shillings (KES) and include applicable taxes.
          Payments are processed via M-Pesa using Safaricom&apos;s official
          Daraja API. Your order completes when payment is confirmed.
        </p>
      </LegalSection>

      <LegalSection heading="4. Digital Product License">
        <p>
          Each purchase grants you a personal, non-exclusive, non-transferable
          license to use the product for yourself or your business. You may not
          resell, redistribute, share download links, or publish the materials
          as your own. Bundles are licensed per product contained within them.
        </p>
      </LegalSection>

      <LegalSection heading="5. Downloads">
        <p>
          Download links are tied to your order and include fair-use limits
          (typically 5 downloads per item) to protect against abuse. Lifetime
          re-download access is available from your dashboard while your account
          is active.
        </p>
      </LegalSection>

      <LegalSection heading="6. Refunds">
        <p>
          Every purchase is covered by our 30-day money-back guarantee, as
          described in the Refund Policy.
        </p>
      </LegalSection>

      <LegalSection heading="7. Acceptable Use">
        <p>
          You agree not to attempt to bypass payment, download limits or access
          controls; probe or attack the platform; or use products for unlawful
          purposes.
        </p>
      </LegalSection>

      <LegalSection heading="8. Intellectual Property">
        <p>
          All products and site content remain the property of JM Majiwa and its
          creators. The JM Majiwa name, logo and branding may not be used
          without written permission.
        </p>
      </LegalSection>

      <LegalSection heading="9. Liability">
        <p>
          Products are provided &quot;as is&quot;. To the maximum extent
          permitted by law, our total liability for any claim is limited to the
          amount you paid for the product in question.
        </p>
      </LegalSection>

      <LegalSection heading="10. Changes & Termination">
        <p>
          We may update these terms from time to time and may suspend accounts
          that violate them. Questions? Email support@jmmajiwa.com.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
