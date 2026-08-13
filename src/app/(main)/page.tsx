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

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [bundles, posts, categories] = await Promise.all([
    getBundles(),
    getBlogPosts(),
    getCategoriesWithCounts(),
  ]);

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
