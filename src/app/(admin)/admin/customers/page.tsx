"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatPrice, formatDate, getInitials } from "@/lib/utils";
import { Card, PageHeader, inputCls } from "@/components/admin/ui";

interface CustomerRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  total_orders: number;
  total_spent: number;
}

export default function AdminCustomersPage() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const sp = new URLSearchParams({ limit: "100" });
        if (search) sp.set("search", search);
        const res = await fetch(`/api/admin/customers?${sp}`);
        const data = await res.json();
        setRows(data.data ?? []);
        setTotal(data.pagination?.total ?? 0);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" subtitle={`${total} registered customer${total === 1 ? "" : "s"}`} />

      <Card className="!p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className={inputCls + " !pl-10"}
          />
        </div>
      </Card>

      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Phone</th>
                <th className="px-5 py-4 font-semibold">Orders</th>
                <th className="px-5 py-4 font-semibold">Total spent</th>
                <th className="px-5 py-4 font-semibold">Joined</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-white/40">Loading customers…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-white/40">No customers yet — they appear here after registering.</td></tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-navy-600">
                          {c.avatar_url ? (
                            <Image src={c.avatar_url} alt={c.full_name ?? "avatar"} fill sizes="40px" className="object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                              {getInitials(c.full_name ?? c.email)}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-white">{c.full_name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-white/60">{c.email}</td>
                    <td className="px-5 py-3.5 text-white/60">{c.phone ?? "—"}</td>
                    <td className="px-5 py-3.5 text-white/60">{c.total_orders}</td>
                    <td className="px-5 py-3.5 font-semibold text-white">{formatPrice(c.total_spent)}</td>
                    <td className="px-5 py-3.5 text-white/50">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/customers/${c.id}`} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/10 hover:text-white">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
