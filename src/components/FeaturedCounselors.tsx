import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Award, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const counselors = [
  {
    name: "Dr. Meera Gupta",
    specialization: "Engineering & Technology Pathways",
    experience: "15+ years",
    rating: 4.9,
    clients: "500+",
    image: "👩‍🔬",
    bio: "Specialized in guiding students towards STEM careers with a focus on emerging technologies.",
    languages: ["English", "हिंदी"],
    expertise: ["IIT/JEE Preparation", "Engineering Streams", "Tech Careers"]
  },
  {
    name: "Prof. Rajesh Kumar",
    specialization: "Creative Arts & Design Careers",
    experience: "12+ years", 
    rating: 4.8,
    clients: "350+",
    image: "👨‍🎨",
    bio: "Helping creative minds discover opportunities in arts, design, and media industries.",
    languages: ["English", "हिंदी"],
    expertise: ["Fine Arts", "Graphic Design", "Media Studies"]
  },
  {
    name: "Dr. Priya Sharma",
    specialization: "Medical & Healthcare Guidance",
    experience: "18+ years",
    rating: 4.9,
    clients: "600+", 
    image: "👩‍⚕️",
    bio: "Expert guidance for medical aspirants including NEET preparation and healthcare careers.",
    languages: ["English", "हिंदी"],
    expertise: ["NEET Preparation", "Medical Streams", "Healthcare Careers"]
  }
];

export const FeaturedCounselors = () => {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { language, t } = useLanguage();

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
                  <div className="text-5xl">{counselor.image}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {counselor.name}
                    </h3>
                    <p className="text-primary font-medium text-sm mb-2">
                      {counselor.specialization}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4" />
                        <span>{counselor.experience}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{counselor.clients}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(counselor.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {counselor.rating}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {counselor.bio}
                </p>

                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xs font-medium text-muted-foreground">{t('counselors.languages')}:</span>
                  {counselor.languages.map((lang, langIndex) => (
                    <Badge key={langIndex} variant="secondary" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {counselor.expertise.map((skill, skillIndex) => (
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