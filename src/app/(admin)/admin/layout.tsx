import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const demo = !isSupabaseConfigured();

  let adminName = "Demo Admin";
  let adminEmail = "admin@jmmajiwa.com";
  let productCount = 12;
  let pendingOrders = 1;

  if (!demo) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    // Not logged in → login page
    if (!data.user) redirect("/login?next=/admin");

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("is_admin, full_name, email")
      .eq("id", data.user.id)
      .single();

    // Logged in but not an admin → homepage
    if (!profile?.is_admin) redirect("/");

    adminName = profile.full_name ?? "Admin";
    adminEmail = profile.email ?? "";

    const [pc, po] = await Promise.all([
      admin.from("products").select("id", { count: "exact", head: true }),
      admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    productCount = pc.count ?? 0;
    pendingOrders = po.count ?? 0;
  }

  return (
    <div className="min-h-screen bg-navy-950 lg:flex">
      <AdminSidebar
        productCount={productCount}
        pendingOrders={pendingOrders}
        adminName={adminName}
        adminEmail={adminEmail}
        demoMode={demo}
      />
      <div className="min-w-0 flex-1">
        {demo && (
          <div className="border-b border-orange-500/20 bg-orange-500/10 px-6 py-2 text-center text-xs font-semibold text-orange-300">
            🧪 Demo mode — Supabase is not configured, showing sample data. Add
            your credentials to manage the live store.
          </div>
        )}
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
