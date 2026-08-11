import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { NewsletterWelcome } from "../../../../emails/NewsletterWelcome";
import { APP_URL } from "@/lib/env";

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

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from("newsletter_subscribers")
        .upsert({ email, subscribed_at: new Date().toISOString() }, { onConflict: "email" });
      if (error) {
        console.error("[newsletter] insert failed", error);
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
      message: "Subscribed successfully",
    });
  } catch (err) {
    console.error("[newsletter] unexpected error", err);
    return NextResponse.json(
      { error: "Could not subscribe. Please try again." },
      { status: 500 }
    );
  }
}
