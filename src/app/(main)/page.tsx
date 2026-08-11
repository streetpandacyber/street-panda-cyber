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

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <BestSellers />
      <HowItWorks />
      <FeaturedBundles />
      <WhyChooseUs />
      <Testimonials />
      <TrustSection />
      <LearningHubPreview />
      <NewsletterSection />
    </>
  );
}
