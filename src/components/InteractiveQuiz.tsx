import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronRight, RefreshCw, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const questions = [
  {
    question: "What energizes you the most?",
    options: [
      { text: "Solving complex problems", type: "analytical" },
      { text: "Creating something beautiful", type: "creative" },
      { text: "Helping others succeed", type: "social" },
      { text: "Leading and organizing", type: "leadership" }
    ]
  },
  {
    question: "In group projects, you usually:",
    options: [
      { text: "Research and analyze data", type: "analytical" },
      { text: "Design and visualize ideas", type: "creative" },
      { text: "Facilitate team collaboration", type: "social" },
      { text: "Plan and delegate tasks", type: "leadership" }
    ]
  },
  {
    question: "Your ideal work environment is:",
    options: [
      { text: "A quiet space with data and tools", type: "analytical" },
      { text: "An inspiring studio or workspace", type: "creative" },
      { text: "A collaborative, people-focused space", type: "social" },
      { text: "A dynamic office with meetings", type: "leadership" }
    ]
  }
];

const careerSuggestions = {
  analytical: {
    title: "The Analyst",
    careers: ["Data Scientist", "Engineer", "Researcher", "Financial Analyst"],
    description: "You have a natural ability to break down complex problems and find logical solutions.",
    color: "from-blue-500 to-purple-500"
  },
  creative: {
    title: "The Creator", 
    careers: ["Graphic Designer", "Architect", "Writer", "Film Director"],
    description: "You thrive on expressing ideas and bringing imagination to life.",
    color: "from-pink-500 to-orange-500"
  },
  social: {
    title: "The Helper",
    careers: ["Teacher", "Counselor", "Social Worker", "Healthcare Professional"],
    description: "You find fulfillment in making a positive impact on people's lives.",
    color: "from-green-500 to-teal-500"
  },
  leadership: {
    title: "The Leader",
    careers: ["Business Manager", "Entrepreneur", "Project Manager", "Consultant"],
    description: "You excel at organizing, motivating, and guiding others toward success.",
    color: "from-purple-500 to-indigo-500"
  }
};

export const InteractiveQuiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");

  const handleAnswer = (type: string) => {
    setSelectedAnswer(type);
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer("");
      } else {
        calculateResult(newAnswers);
      }
    }, 500);
  };

  const calculateResult = (allAnswers: string[]) => {
    const counts = allAnswers.reduce((acc, answer) => {
      acc[answer] = (acc[answer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantType = Object.entries(counts).reduce((a, b) => 
      counts[a[0]] > counts[b[0]] ? a : b
    )[0];

    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setSelectedAnswer("");
  };

  const getDominantType = () => {
    const counts = answers.reduce((acc, answer) => {
      acc[answer] = (acc[answer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).reduce((a, b) => 
      counts[a[0]] > counts[b[0]] ? a : b
    )[0];
  };

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Discover Your
            <span className="bg-gradient-secondary bg-clip-text text-transparent"> Career Personality</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take our quick 3-question quiz to explore career paths that match your personality!
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {!showResults ? (
            <Card className="p-8 bg-gradient-card border-0 shadow-medium animate-scale-in">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  {questions[currentQuestion].question}
                </h3>

                <div className="space-y-4">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option.type)}
                      className={`w-full p-4 text-left border rounded-lg transition-all duration-300 hover:shadow-soft ${
                        selectedAnswer === option.type 
                          ? 'border-primary bg-primary/10 shadow-soft' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      disabled={selectedAnswer !== ""}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">{option.text}</span>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 bg-gradient-card border-0 shadow-medium animate-scale-in">
              {/* Results */}
              <div className="text-center">
                <div className="mb-6">
                  <Award className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    You're {careerSuggestions[getDominantType() as keyof typeof careerSuggestions].title}!
                  </h3>
                  <p className="text-muted-foreground">
                    {careerSuggestions[getDominantType() as keyof typeof careerSuggestions].description}
                  </p>
                </div>

                {/* Career Suggestions */}
                <div className={`p-6 rounded-2xl bg-gradient-to-br ${careerSuggestions[getDominantType() as keyof typeof careerSuggestions].color} mb-8`}>
                  <h4 className="text-xl font-semibold text-white mb-4">
                    Perfect Career Matches:
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {careerSuggestions[getDominantType() as keyof typeof careerSuggestions].careers.map((career, index) => (
                      <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white font-medium">
                        {career}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="hero" 
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
                    Get Detailed Assessment
                  </Button>
                  <Button variant="outline" onClick={resetQuiz} size="lg">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  This is just a fun preview! Get a comprehensive career assessment with our expert counselors.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* CTA */}
        {!showResults && (
          <div className="text-center mt-12 animate-fade-in">
            <p className="text-muted-foreground mb-4">
              Want more detailed insights about your career potential?
            </p>
            <Button 
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
              Schedule Professional Assessment
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};