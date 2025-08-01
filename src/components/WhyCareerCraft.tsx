import { Card } from "@/components/ui/card";
import { Users, Target, Globe, Lightbulb, Award, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const WhyCareerCraft = () => {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { language, t } = useLanguage();

  const features = [
    {
      icon: Target,
      title: t('feature.personalized.title'),
      description: t('feature.personalized.desc'),
      color: "text-primary"
    },
    {
      icon: Users,
      title: t('feature.expert.title'),
      description: t('feature.expert.desc'),
      color: "text-secondary"
    },
    {
      icon: Globe,
      title: t('feature.bilingual.title'),
      description: t('feature.bilingual.desc'),
      color: "text-primary"
    },
    {
      icon: Lightbulb,
      title: t('feature.convenient.title'),
      description: t('feature.convenient.desc'),
      color: "text-secondary"
    },
    {
      icon: Award,
      title: t('feature.assessments.title'),
      description: t('feature.assessments.desc'),
      color: "text-primary"
    },
    {
      icon: Clock,
      title: t('feature.affordable.title'),
      description: t('feature.affordable.desc'),
      color: "text-secondary"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t('why.title')} 
            <span className="bg-gradient-primary bg-clip-text text-transparent"> {t('why.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('why.subtitle')}
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-4 leading-relaxed">
            {t('why.description')}
          </p>
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
            {t('why.cta')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="border border-primary/20 text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-white hover:shadow-medium transition-all duration-300"
              onClick={async () => {
                const currentLang = lang || language;
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                  navigate(`/${currentLang}/dashboard?tab=assessments`);
                } else {
                  navigate(`/${currentLang}/auth`);
                }
              }}
            >
              {t('howit.cta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};