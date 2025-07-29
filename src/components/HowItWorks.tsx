import { Card } from "@/components/ui/card";
import { Search, Users, Rocket, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Explore",
    description: "Discover your strengths and interests with our comprehensive assessments and interactive tools.",
    details: "Take personality tests, aptitude assessments, and explore various career paths that align with your unique profile."
  },
  {
    icon: Users,
    step: "02", 
    title: "Connect",
    description: "Book a personalized session with our expert counselors who understand your goals and challenges.",
    details: "Get matched with counselors specializing in your areas of interest. Available in English and हिंदी."
  },
  {
    icon: Rocket,
    step: "03",
    title: "Succeed", 
    description: "Gain clarity and craft a roadmap for your dream career with actionable steps and ongoing support.",
    details: "Receive a personalized career plan, skill development recommendations, and continuous guidance."
  }
];

export const HowItWorks = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            How It
            <span className="bg-gradient-secondary bg-clip-text text-transparent"> Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to discover your ideal career path and build a successful future.
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connection Lines - Hidden on mobile */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-20 transform -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <div key={index} className="relative animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
                {/* Step Card */}
                <Card className="p-8 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105 relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-medium">
                    {step.step}
                  </div>
                  
                  <div className="flex flex-col items-center text-center space-y-6 pt-4">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-gradient-primary/10 rounded-2xl flex items-center justify-center">
                      <step.icon className="w-10 h-10 text-primary" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-foreground">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>

                    {/* Details */}
                    <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
                      {step.details}
                    </div>
                  </div>
                </Card>

                {/* Arrow - Only show between cards on large screens */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                    <div className="w-12 h-12 bg-white rounded-full shadow-soft flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="bg-gradient-hero p-8 rounded-2xl shadow-medium max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Begin Your Career Journey?
            </h3>
            <p className="text-white/90 mb-6 text-lg">
              Join thousands of students who have discovered their perfect career path with Career Craft.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              variant="cta"
              size="lg"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};