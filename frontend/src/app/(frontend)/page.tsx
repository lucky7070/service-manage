import { HeroSection } from "@/components/front/home/hero-section"
import { TrustBadges } from "@/components/front/home/trust-badges"
import { ServiceCategories } from "@/components/front/home/service-categories"
import { HowItWorks } from "@/components/front/home/how-it-works"
import { FeaturedPros } from "@/components/front/home/featured-pros"
import { Testimonials } from "@/components/front/home/testimonials"
import { CTABanner } from "@/components/front/home/cta-banner"

export default function HomePage() {
    return <>
        <HeroSection />
        <TrustBadges />
        <ServiceCategories />
        <HowItWorks />
        <FeaturedPros />
        <Testimonials />
        <CTABanner />
    </>
}
