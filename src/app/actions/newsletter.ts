"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { NewsletterWelcome } from "../../../emails/NewsletterWelcome";
import { APP_URL } from "@/lib/env";

const schema = z.object({ email: z.string().email() });

export async function subscribeNewsletterAction(
  formData: FormData
): Promise<{ error?: string; message?: string }> {
  const parsed = schema.safeParse({ email: String(formData.get("email") ?? "") });
  if (!parsed.success) return { error: "Please enter a valid email address." };
  const email = parsed.data.email.toLowerCase().trim();

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, unsubscribed_at")
      .eq("email", email)
      .single();

    if (existing && !existing.unsubscribed_at) {
      return { message: "You're already subscribed!" };
    }
    if (existing) {
      await supabase
        .from("newsletter_subscribers")
        .update({ unsubscribed_at: null, subscribed_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("newsletter_subscribers")
        .insert({ email, subscribed_at: new Date().toISOString() });
    }
  }

  try {
    await sendEmail({
      to: email,
      subject: "Welcome to JM Majiwa! Your FREE AI Prompt Pack is inside 🎁",
      react: NewsletterWelcome({
        email,
        downloadUrl: `${APP_URL}/free/ai-starter-prompt-pack.pdf`,
      }),
    });
  } catch (err) {
    console.error("[newsletter] welcome email failed", err);
  }

  return { message: "Subscribed! Your free AI prompt pack is on its way." };
}
