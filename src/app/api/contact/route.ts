import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ContactMessage } from "../../../../emails/ContactMessage";
import { sendEmail } from "@/lib/email";
import { isResendConfigured } from "@/lib/env";
import { ApiError, apiError } from "@/lib/api/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(5000),
});

const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;
const recentRequests = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = recentRequests.get(key);
  if (!current || current.resetAt <= now) {
    recentRequests.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    if (recentRequests.size > 1000) recentRequests.clear();
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(getClientKey(request))) {
      throw new ApiError(429, "Too many messages. Please try again in a minute.");
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please complete every field with valid information." },
        { status: 400 }
      );
    }

    if (!isResendConfigured()) {
      throw new ApiError(
        503,
        "Support messaging is temporarily unavailable. Please email us directly."
      );
    }

    const { name, email, subject, message } = parsed.data;
    const recipient = process.env.ADMIN_EMAIL ?? "streetpandacyber@gmail.com";
    const result = await sendEmail({
      to: recipient,
      subject: `[Contact] ${subject}`,
      react: ContactMessage({ name, email, subject, message }),
      replyTo: email,
    });

    if ("skipped" in result && result.skipped) {
      throw new ApiError(
        503,
        "Support messaging is temporarily unavailable. Please email us directly."
      );
    }
    if ("error" in result && result.error) {
      console.error("[contact] support email failed", result.error);
      throw new ApiError(
        502,
        "We could not deliver your message. Please try again or email us directly."
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message received. We will reply within a few hours.",
    });
  } catch (err) {
    return apiError(err);
  }
}
