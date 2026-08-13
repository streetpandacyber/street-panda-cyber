import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { APP_URL, isSupabaseConfigured } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { NewsletterWelcome } from "../../../../emails/NewsletterWelcome";
import { apiError } from "@/lib/api/guards";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }
    const email = parsed.data.email.toLowerCase().trim();

    let alreadySubscribed = false;

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();

      const { data: existing } = await supabase
        .from("newsletter_subscribers")
        .select("id, unsubscribed_at")
        .eq("email", email)
        .single();

      if (existing && !existing.unsubscribed_at) {
        alreadySubscribed = true;
      } else if (existing) {
        // previously unsubscribed — re-subscribe
        await supabase
          .from("newsletter_subscribers")
          .update({ unsubscribed_at: null, subscribed_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        const { error } = await supabase
          .from("newsletter_subscribers")
          .insert({ email, subscribed_at: new Date().toISOString() });
        if (error) console.error("[newsletter] insert failed", error);
      }
    }

    // Welcome email with the free AI prompt pack (never blocks signup)
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

    return NextResponse.json({
      success: true,
      alreadySubscribed,
      message: alreadySubscribed
        ? "You're already subscribed — the free pack is in your inbox!"
        : "Subscribed successfully — check your inbox for your free gift!",
    });
  } catch (err) {
    return apiError(err);
  }
}
