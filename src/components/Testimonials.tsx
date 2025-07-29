import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    age: "Class 12 Student",
    image: "👩‍🎓",
    quote: "I was completely confused about choosing between Engineering and Medical. Career Craft helped me discover my true passion for Biotechnology!",
    outcome: "Found my passion",
    rating: 5
  },
  {
    name: "Rahul Patel", 
    age: "College Freshman",
    image: "👨‍💼",
    quote: "The counselors explained everything in Hindi which made me feel comfortable. Now I'm confident about my Business Administration path.",
    outcome: "Clear about next steps",
    rating: 5
  },
  {
    name: "Ananya Singh",
    age: "Class 10 Student", 
    image: "👩‍🎨",
    quote: "I never thought Art could be a viable career option. Career Craft showed me amazing opportunities in Creative Design!",
    outcome: "Got into dream college",
    rating: 5
  },
  {
    name: "Arjun Kumar",
    age: "College Student",
    image: "👨‍💻",
    quote: "The assessment tools were amazing! I discovered I have strong analytical skills and now I'm pursuing Data Science.",
    outcome: "Found hidden strengths",
    rating: 5
  }
];

export const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Student 
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Success Stories</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real students, real transformations. See how Career Craft has helped thousands find their perfect career path.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-8 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105 animate-scale-in relative overflow-hidden group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-12 h-12 text-primary" />
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {testimonial.name}
                    </h3>
                    <p className="text-muted-foreground">{testimonial.age}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-foreground leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Outcome Badge */}
                <div className="inline-flex items-center space-x-2 bg-gradient-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>{testimonial.outcome}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 animate-fade-in">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">5000+</div>
            <div className="text-muted-foreground">Students Guided</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">98%</div>
            <div className="text-muted-foreground">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
            <div className="text-muted-foreground">Expert Counselors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">2</div>
            <div className="text-muted-foreground">Languages Supported</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 animate-fade-in">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to write your own success story?
          </p>
          <Button 
            variant="hero"
            size="lg"
            onClick={() => window.location.href = '/auth'}
          >
            Join Our Community
          </Button>
        </div>
      </div>
    </section>
  );
};