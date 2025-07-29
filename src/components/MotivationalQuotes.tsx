import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useNavigate } from "react-router-dom";

const quotes = [
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    gradient: "from-primary to-blue-500"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs", 
    gradient: "from-secondary to-orange-500"
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    gradient: "from-green-500 to-teal-500"
  }
];

export const MotivationalQuotes = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Words of
            <span className="bg-gradient-secondary bg-clip-text text-transparent"> Inspiration</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Let these powerful words fuel your journey towards a fulfilling career.
          </p>
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {quotes.map((quote, index) => (
            <div 
              key={index}
              className="animate-scale-in transform hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className={`p-8 rounded-2xl bg-gradient-to-br ${quote.gradient} shadow-medium hover:shadow-strong transition-all duration-300 relative overflow-hidden group`}>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="relative z-10">
                  {/* Quote Mark */}
                  <div className="text-6xl text-white/20 font-serif mb-4">"</div>
                  
                  {/* Quote Text */}
                  <blockquote className="text-white text-lg md:text-xl leading-relaxed mb-6 font-medium">
                    {quote.text}
                  </blockquote>
                  
                  {/* Author */}
                  <div className="flex items-center">
                    <div className="w-1 h-8 bg-white/50 mr-4"></div>
                    <cite className="text-white/90 font-semibold not-italic">
                      {quote.author}
                    </cite>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inspirational CTA */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="bg-gradient-card rounded-2xl p-8 shadow-soft max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Your Success Story Starts Today
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Every great achievement began with the decision to try. Take the first step towards 
              discovering your potential and crafting the career of your dreams.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              variant="hero"
              size="lg"
            >
              Begin Your Journey
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};