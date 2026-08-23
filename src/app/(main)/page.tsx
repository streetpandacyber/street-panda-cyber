import { getBlogPosts, getBundles, getCategoriesWithCounts } from "@/lib/data/service";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { BestSellers } from "@/components/home/BestSellers";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedBundles } from "@/components/home/FeaturedBundles";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Testimonials } from "@/components/home/Testimonials";
import { TrustSection } from "@/components/home/TrustSection";
import { LearningHubPreview } from "@/components/home/LearningHubPreview";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { StoreUnavailable } from "@/components/errors/StoreUnavailable";

export const dynamic = "force-dynamic";

async function loadHomeData() {
  try {
    return await Promise.all([
      getBundles(),
      getBlogPosts(),
      getCategoriesWithCounts(),
    ] as const);
  } catch (error) {
    console.error("[home] storefront data unavailable", error);
    return null;
  }
}

export default async function HomePage() {
  const data = await loadHomeData();
  if (!data) return <StoreUnavailable />;

  const [bundles, posts, categories] = data;
  return (
    <>
      <HeroSection />
      <FeaturedCategories categories={categories} />
      <BestSellers />
      <HowItWorks />
      <FeaturedBundles bundles={bundles} />
      <WhyChooseUs />
      <Testimonials />
      <TrustSection />
      <LearningHubPreview posts={posts} />
      <NewsletterSection />
    </>
  );
}
