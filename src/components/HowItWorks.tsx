import { Card } from "@/components/ui/card";
import { Search, Users, Rocket, ArrowRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const HowItWorks = () => {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { language, t } = useLanguage();

  const steps = [
    {
      icon: Search,
      step: "01",
      title: t('howit.step1.title'),
      description: t('howit.step1.desc'),
      details: t('howit.step1.details')
    },
    {
      icon: Users,
      step: "02", 
      title: t('howit.step2.title'),
      description: t('howit.step2.desc'),
      details: t('howit.step2.details')
    },
    {
      icon: Rocket,
      step: "03",
      title: t('howit.step3.title'), 
      description: t('howit.step3.desc'),
      details: t('howit.step3.details')
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t('howit.title')}
            <span className="bg-gradient-secondary bg-clip-text text-transparent"> Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('howit.subtitle')}
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
            <button 
              onClick={() => {
                const currentLang = lang || language;
                navigate(`/${currentLang}/auth`);
              }}
              className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:shadow-strong transform hover:scale-105 transition-all duration-300"
            >
              {t('howit.cta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};