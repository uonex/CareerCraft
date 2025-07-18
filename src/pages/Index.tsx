import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { WhyCareerCraft } from "@/components/WhyCareerCraft";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { MotivationalQuotes } from "@/components/MotivationalQuotes";
import { FeaturedCounselors } from "@/components/FeaturedCounselors";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <WhyCareerCraft />
        <HowItWorks />
        <Testimonials />
        <MotivationalQuotes />
        <FeaturedCounselors />
        <InteractiveQuiz />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
