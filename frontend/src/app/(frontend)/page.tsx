import { Header } from "@/components/front/header"
import { HeroSection } from "@/components/front/home/hero-section"
import { TrustBadges } from "@/components/front/home/trust-badges"
import { ServiceCategories } from "@/components/front/home/service-categories"
import { HowItWorks } from "@/components/front/home/how-it-works"
import { FeaturedPros } from "@/components/front/home/featured-pros"
import { Testimonials } from "@/components/front/home/testimonials"
import { CTABanner } from "@/components/front/home/cta-banner"
import { Footer } from "@/components/front/footer"

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main>
                <HeroSection />
                <TrustBadges />
                <ServiceCategories />
                <HowItWorks />
                <FeaturedPros />
                <Testimonials />
                <CTABanner />
            </main>
            <Footer />
        </div>
    )
}
