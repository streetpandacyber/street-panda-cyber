"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchNotFound() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      query.trim()
        ? `/marketplace?q=${encodeURIComponent(query.trim())}`
        : "/marketplace"
    );
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="input-field !pl-11"
          aria-label="Search products"
        />
      </div>
      <button type="submit" className="btn-primary shrink-0">
        Search
      </button>
    </form>
  );
}
