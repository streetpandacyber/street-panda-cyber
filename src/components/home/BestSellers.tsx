import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/data/service";
import { MOCK_PRODUCTS } from "@/lib/data/mock";
import { ProductCard } from "@/components/marketplace/ProductCard";

export async function BestSellers() {
  const products = await getProducts({});
  const bestSellers =
    products.filter((p) => p.is_best_seller).slice(0, 6).length > 0
      ? products.filter((p) => p.is_best_seller).slice(0, 6)
      : MOCK_PRODUCTS.filter((p) => p.is_best_seller).slice(0, 6);

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="badge-orange">🔥 Best Sellers</span>
            <h2 className="section-title mt-4">
              Loved by <span className="text-gradient-orange">Thousands</span> of
              Kenyans
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-gray-500">
              Our top-rated products — tested daily by creators, students and
              business owners across Kenya.
            </p>
          </div>
          <Link href="/marketplace" className="btn-secondary shrink-0">
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 text-center lg:hidden">
          <Link href="/marketplace" className="btn-secondary">
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
