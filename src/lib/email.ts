import { Resend } from "resend";
import { render } from "@react-email/render";
import { isResendConfigured } from "@/lib/env";

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

/**
 * Sends a transactional email via Resend.
 * Silently no-ops when Resend is not configured so flows keep working.
 */
export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  if (!isResendConfigured()) {
    console.info(`[email] skipped (Resend not configured) → ${to}: ${subject}`);
    return { skipped: true as const };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromName = process.env.FROM_NAME ?? "JM Majiwa";
  const fromEmail = process.env.FROM_EMAIL ?? "noreply@jmmajiwa.com";
  const html = await render(react);

  return resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
  });
}
