import { Card } from "@/components/ui/card";
import { Users, Target, Globe, Lightbulb, Award, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const features = [
  {
    icon: Target,
    title: "Personalized Guidance",
    description: "Tailored career advice designed specifically for YOUR unique strengths and interests.",
    color: "text-primary"
  },
  {
    icon: Users,
    title: "Expert Counselors",
    description: "Learn from industry professionals with years of experience in career guidance.",
    color: "text-secondary"
  },
  {
    icon: Globe,
    title: "Dual Language Support",
    description: "Get guidance in English & हिंदी - choose what's comfortable for you.",
    color: "text-primary"
  },
  {
    icon: Lightbulb,
    title: "Easy & Intuitive",
    description: "Simple steps to success with our user-friendly platform and clear guidance.",
    color: "text-secondary"
  },
  {
    icon: Award,
    title: "Future-Ready Insights",
    description: "Stay ahead with knowledge about emerging careers and industry trends.",
    color: "text-primary"
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Book sessions that fit your schedule with our convenient online platform.",
    color: "text-secondary"
  }
];

export const WhyCareerCraft = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Why Choose 
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Career Craft</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We understand the challenges students face when choosing their career path. 
            That's why we've created a platform that addresses your specific needs.
          </p>
        </div>

        {/* Pain Points */}
        <div className="mb-12 text-center animate-slide-up">
          <div className="bg-gradient-card rounded-2xl p-8 shadow-soft max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Feeling overwhelmed about your future?
            </h3>
            <div className="flex flex-wrap justify-center gap-4 text-muted-foreground">
              <span className="bg-muted/50 px-4 py-2 rounded-full">"Confused about stream selection"</span>
              <span className="bg-muted/50 px-4 py-2 rounded-full">"Don't know my strengths"</span>
              <span className="bg-muted/50 px-4 py-2 rounded-full">"Worried about future job prospects"</span>
              <span className="bg-muted/50 px-4 py-2 rounded-full">"Need guidance in my language"</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-8 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105 animate-scale-in group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-primary/10 flex items-center justify-center group-hover:bg-gradient-primary/20 transition-all duration-300`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to take control of your career journey?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="border border-primary/20 text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-white hover:shadow-medium transition-all duration-300"
              variant="outline"
              size="lg"
              onClick={async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                  navigate('/dashboard?tab=assessments');
                } else {
                  navigate('/auth');
                }
              }}
            >
              Take Free Assessment
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};