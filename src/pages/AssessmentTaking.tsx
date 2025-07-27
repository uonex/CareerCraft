import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  text: string;
  options: string[];
  type: 'multiple-choice' | 'scale';
}

const AssessmentTaking = () => {
  const { assessmentType } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initializeAssessment();
  }, [assessmentType]);

  const initializeAssessment = () => {
    // Mock questions based on assessment type
    let title = "";
    let mockQuestions: Question[] = [];

    switch (assessmentType) {
      case "career-aptitude":
        title = "Career Aptitude Test";
        mockQuestions = [
          {
            id: "q1",
            text: "How comfortable are you with analyzing complex data?",
            options: ["Very comfortable", "Somewhat comfortable", "Neutral", "Somewhat uncomfortable", "Very uncomfortable"],
            type: "multiple-choice"
          },
          {
            id: "q2",
            text: "Rate your interest in working with technology",
            options: ["1", "2", "3", "4", "5"],
            type: "scale"
          },
          {
            id: "q3",
            text: "How much do you enjoy leading teams?",
            options: ["Love it", "Like it", "Neutral", "Dislike it", "Hate it"],
            type: "multiple-choice"
          }
        ];
        break;
      case "interest-profiler":
        title = "Interest Profiler";
        mockQuestions = [
          {
            id: "q1",
            text: "Which environment appeals to you most?",
            options: ["Office setting", "Outdoor environment", "Laboratory", "Creative studio", "Healthcare facility"],
            type: "multiple-choice"
          },
          {
            id: "q2",
            text: "Rate your interest in helping others",
            options: ["1", "2", "3", "4", "5"],
            type: "scale"
          }
        ];
        break;
      case "personality-assessment":
        title = "Personality Assessment";
        mockQuestions = [
          {
            id: "q1",
            text: "I prefer working alone rather than in groups",
            options: ["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"],
            type: "multiple-choice"
          },
          {
            id: "q2",
            text: "How organized are you?",
            options: ["1", "2", "3", "4", "5"],
            type: "scale"
          }
        ];
        break;
      default:
        navigate("/dashboard");
        return;
    }

    setAssessmentTitle(title);
    setQuestions(mockQuestions);
    setLoading(false);
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error("Please log in to submit assessment");
        navigate("/auth");
        return;
      }

      // Calculate a mock score based on answers
      const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100

      // Generate mock career suggestions
      const careerSuggestions = getCareerSuggestions(assessmentType);

      // Save assessment result
      const { error } = await supabase.from("assessments").insert({
        user_id: user.id,
        assessment_type: assessmentTitle,
        score: score,
        career_suggestions: careerSuggestions,
        results_json: {
          answers: answers,
          questions: questions.length,
          completedAt: new Date().toISOString()
        }
      });

      if (error) throw error;

      toast.success("Assessment completed successfully!");
      navigate("/dashboard", { state: { activeSection: "assessments" } });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const getCareerSuggestions = (type: string | undefined): string[] => {
    switch (type) {
      case "career-aptitude":
        return ["Software Engineer", "Data Analyst", "Project Manager", "Business Analyst"];
      case "interest-profiler":
        return ["Healthcare Professional", "Environmental Scientist", "Creative Director", "Social Worker"];
      case "personality-assessment":
        return ["Research Scientist", "Counselor", "Marketing Manager", "Financial Advisor"];
      default:
        return ["General Career Guidance Recommended"];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading assessment...</div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard", { state: { activeSection: "assessments" } })}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-2xl font-bold mb-2">{assessmentTitle}</h1>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentQ.text}</CardTitle>
            <CardDescription>
              {currentQ.type === "scale" 
                ? "Rate on a scale of 1-5 (1 = Lowest, 5 = Highest)"
                : "Select the option that best describes you"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {currentQ.options.map((option, index) => (
                <Button
                  key={index}
                  variant={answers[currentQ.id] === option ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => handleAnswer(option)}
                >
                  {currentQ.type === "scale" ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{option}</span>
                      {option === "1" && <span className="text-sm text-muted-foreground">Lowest</span>}
                      {option === "5" && <span className="text-sm text-muted-foreground">Highest</span>}
                    </div>
                  ) : (
                    option
                  )}
                </Button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!answers[currentQ.id] || submitting}
                >
                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Assessment
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!answers[currentQ.id]}
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentTaking;