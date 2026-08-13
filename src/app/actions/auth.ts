"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

type ActionResult = { error?: string; message?: string };

export async function loginAction(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured on this deployment." };
  }
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured on this deployment." };
  }
  const full_name = String(formData.get("full_name") ?? "");
  const email = String(formData.get("email") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, phone, newsletter_subscribed: true } },
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  if (data.session) redirect("/dashboard");
  return { message: "Check your email to confirm your account." };
}

export async function logoutAction(): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: "Not configured." };
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function resetPasswordAction(
  formData: FormData
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured on this deployment." };
  }
  const email = String(formData.get("email") ?? "");
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  });
  if (error) return { error: error.message };
  return { message: "Reset link sent — check your inbox." };
}

export async function updateProfileAction(
  formData: FormData
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured on this deployment." };
  }
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Not authenticated." };

  const updates = {
    full_name: String(formData.get("full_name") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    country: String(formData.get("country") ?? "Kenya"),
    city: String(formData.get("city") ?? "") || null,
    bio: String(formData.get("bio") ?? "") || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userData.user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return { message: "Profile updated." };
}
