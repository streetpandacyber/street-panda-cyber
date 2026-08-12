import { getCategories, getProducts } from "@/lib/data/service";
import { MarketplaceBrowser } from "./MarketplaceBrowser";

interface MarketplaceAsyncProps {
  initialQuery?: string;
  initialCategory?: string;
}

/**
 * Async server component — suspends inside the marketplace page's
 * <Suspense> boundary so the header renders instantly while products load.
 */
export async function MarketplaceAsync({
  initialQuery,
  initialCategory,
}: MarketplaceAsyncProps) {
  const [products, categories] = await Promise.all([
    getProducts({}),
    getCategories(),
  ]);

  return (
    <MarketplaceBrowser
      products={products}
      categories={categories}
      initialQuery={initialQuery ?? ""}
      initialCategory={initialCategory}
    />
  );
}
