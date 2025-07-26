import { useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();

  useEffect(() => {
    // Handle scrolling when navigated from header
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
      // Clear the state to prevent re-scrolling on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section id="hero">
          <HeroSection />
        </section>
        <section id="services">
          <WhyCareerCraft />
          <HowItWorks />
        </section>
        <section id="testimonials">
          <Testimonials />
        </section>
        <section id="quotes">
          <MotivationalQuotes />
        </section>
        <section id="counselors">
          <FeaturedCounselors />
        </section>
        <section id="quiz">
          <InteractiveQuiz />
        </section>
        <section id="resources">
          {/* This could be expanded with more resources content */}
        </section>
      </main>
      <section id="contact">
        <Footer />
      </section>
    </div>
  );
};

export default Index;
