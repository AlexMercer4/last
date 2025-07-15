import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import WhyChooseSection from '@/components/landing/WhyChooseSection';
import CTASection from '@/components/landing/CTASection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <HeroSection />
        <FeaturesSection />
        <WhyChooseSection />
        <CTASection />
      </main>
    </div>
  );
}