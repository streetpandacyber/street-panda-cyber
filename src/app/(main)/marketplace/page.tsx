import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/data/service";
import { MarketplaceBrowser } from "@/components/marketplace/MarketplaceBrowser";

export const metadata: Metadata = {
  title: "Marketplace — Premium Digital Products",
  description:
    "Browse hundreds of premium digital products: AI prompt packs, Canva templates, eBooks, study materials and business templates. Pay with M-Pesa, download instantly.",
};

export const dynamic = "force-dynamic";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const [products, categories] = await Promise.all([
    getProducts({}),
    getCategories(),
  ]);

  return (
    <MarketplaceBrowser
      products={products}
      categories={categories}
      initialQuery={searchParams.q ?? ""}
      initialCategory={searchParams.category}
    />
  );
}
