import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Award, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface Counselor {
  id: string;
  name: string;
  specializations: string[];
  experience_years: number;
  rating?: number;
  total_sessions?: number;
  photo_url?: string;
  bio?: string;
  languages?: string[];
  is_active: boolean;
  availability_json?: any;
  created_at?: string;
  updated_at?: string;
  rate_per_session?: number;
}

export const FeaturedCounselors = () => {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { language, t } = useLanguage();

  useEffect(() => {
    fetchCounselors();
    
    // Set up real-time subscription for counselors updates
    const channel = supabase
      .channel('counselors')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'counselors' }, 
        () => {
          fetchCounselors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCounselors = async () => {
    try {
      const { data, error } = await supabase
        .from("counselors")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });

      if (error) throw error;
      setCounselors(data || []);
    } catch (error) {
      console.error("Error fetching counselors:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse text-lg">Loading counselors...</div>
          </div>
        </div>
      </section>
    );
  }

  if (counselors.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              {t('counselors.title')}
              <span className="bg-gradient-primary bg-clip-text text-transparent"> {t('counselors.titleHighlight')}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('counselors.subtitle')}
            </p>
            <div className="text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No counselors available at the moment</p>
              <p className="text-sm">Please check back later</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t('counselors.title')}
            <span className="bg-gradient-primary bg-clip-text text-transparent"> {t('counselors.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('counselors.subtitle')}
          </p>
        </div>

        {/* Counselors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {counselors.map((counselor, index) => (
            <Card 
              key={index}
              className="p-6 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105 animate-scale-in relative overflow-hidden group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="text-5xl">
                    {counselor.photo_url ? (
                      <img 
                        src={counselor.photo_url} 
                        alt={counselor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-primary/10 flex items-center justify-center text-2xl">
                        👨‍💼
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {counselor.name}
                    </h3>
                    <p className="text-primary font-medium text-sm mb-2">
                      {counselor.specializations.join(", ") || "General Counseling"}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4" />
                        <span>{counselor.experience_years}+ years</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{counselor.total_sessions || 0} sessions</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(counselor.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {counselor.rating || 0}
                  </span>
                </div>

                {counselor.bio && (
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {counselor.bio}
                  </p>
                )}

                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xs font-medium text-muted-foreground">{t('counselors.languages')}:</span>
                  {(counselor.languages || ['English']).map((lang, langIndex) => (
                    <Badge key={langIndex} variant="secondary" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {counselor.specializations.map((skill, skillIndex) => (
                    <Badge 
                      key={skillIndex} 
                      variant="outline" 
                      className="text-xs border-primary/20 text-primary"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    const currentLang = lang || language;
                    navigate(`/${currentLang}/auth`);
                  }}
                  className="w-full bg-gradient-primary text-white py-3 rounded-lg font-medium hover:shadow-medium transform hover:scale-105 transition-all duration-300"
                >
                  {t('counselors.bookSession')}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};