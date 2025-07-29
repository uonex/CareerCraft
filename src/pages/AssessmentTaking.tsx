import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AssessmentQuestion {
  id: string;
  assessment_type_id: string;
  question_id: string;
  question_type: 'single_choice' | 'multi_choice' | 'text_input';
  question_text: string;
  options: Array<{ text: string; value: string }>;
  scoring: Record<string, number>;
  next_question_logic: Array<{ ifValue: string; goTo: string }>;
  min_selections: number;
  max_selections: number;
  placeholder?: string;
  order_index: number;
}

const AssessmentTaking = () => {
  const { assessmentType } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [assessmentId, setAssessmentId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initializeAssessment();
  }, [assessmentType]);

  const initializeAssessment = async () => {
    if (!assessmentType) {
      navigate("/dashboard");
      return;
    }

    try {
      // First, find the assessment type and get its questions
      const { data: assessmentTypeData, error: typeError } = await (supabase as any)
        .from("assessment_types")
        .select("*")
        .eq("name", assessmentType.replace(/-/g, " "))
        .eq("is_active", true)
        .single();

      if (typeError || !assessmentTypeData) {
        // If no custom assessment found, use fallback logic
        await initializeFallbackAssessment();
        return;
      }

      setAssessmentTitle(assessmentTypeData.name);
      setAssessmentId(assessmentTypeData.id);

      // Fetch questions for this assessment
      const { data: questionsData, error: questionsError } = await (supabase as any)
        .from("assessment_questions")
        .select("*")
        .eq("assessment_type_id", assessmentTypeData.id)
        .order("order_index", { ascending: true });

      if (questionsError) throw questionsError;

      if (questionsData && questionsData.length > 0) {
        setQuestions(questionsData);
      } else {
        // No questions found, use fallback
        await initializeFallbackAssessment();
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
      // Use fallback assessment
      await initializeFallbackAssessment();
    } finally {
      setLoading(false);
    }
  };

  const initializeFallbackAssessment = async () => {
    // Fallback mock questions based on assessment type
    let mockQuestions: AssessmentQuestion[] = [];
    let title = "";

    switch (assessmentType) {
      case "career-aptitude":
        title = "Career Aptitude Test";
        mockQuestions = [
          {
            id: "fallback-1",
            assessment_type_id: "fallback",
            question_id: "q1",
            question_type: "single_choice",
            question_text: "How comfortable are you with analyzing complex data?",
            options: [
              { text: "Very comfortable", value: "very_comfortable" },
              { text: "Somewhat comfortable", value: "somewhat_comfortable" },
              { text: "Neutral", value: "neutral" },
              { text: "Somewhat uncomfortable", value: "somewhat_uncomfortable" },
              { text: "Very uncomfortable", value: "very_uncomfortable" }
            ],
            scoring: { very_comfortable: 5, somewhat_comfortable: 4, neutral: 3, somewhat_uncomfortable: 2, very_uncomfortable: 1 },
            next_question_logic: [],
            min_selections: 1,
            max_selections: 1,
            order_index: 0
          },
          {
            id: "fallback-2",
            assessment_type_id: "fallback",
            question_id: "q2",
            question_type: "single_choice",
            question_text: "How much do you enjoy leading teams?",
            options: [
              { text: "Love it", value: "love" },
              { text: "Like it", value: "like" },
              { text: "Neutral", value: "neutral" },
              { text: "Dislike it", value: "dislike" },
              { text: "Hate it", value: "hate" }
            ],
            scoring: { love: 5, like: 4, neutral: 3, dislike: 2, hate: 1 },
            next_question_logic: [],
            min_selections: 1,
            max_selections: 1,
            order_index: 1
          }
        ];
        break;
      case "interest-profiler":
        title = "Interest Profiler";
        mockQuestions = [
          {
            id: "fallback-1",
            assessment_type_id: "fallback",
            question_id: "q1",
            question_type: "multi_choice",
            question_text: "Which environments appeal to you most? (Select up to 2)",
            options: [
              { text: "Office setting", value: "office" },
              { text: "Outdoor environment", value: "outdoor" },
              { text: "Laboratory", value: "lab" },
              { text: "Creative studio", value: "studio" },
              { text: "Healthcare facility", value: "healthcare" }
            ],
            scoring: { office: 3, outdoor: 4, lab: 5, studio: 2, healthcare: 4 },
            next_question_logic: [],
            min_selections: 1,
            max_selections: 2,
            order_index: 0
          }
        ];
        break;
      case "personality-assessment":
        title = "Personality Assessment";
        mockQuestions = [
          {
            id: "fallback-1",
            assessment_type_id: "fallback",
            question_id: "q1",
            question_type: "text_input",
            question_text: "Describe your ideal work environment in a few sentences:",
            options: [],
            scoring: {},
            next_question_logic: [],
            min_selections: 1,
            max_selections: 1,
            placeholder: "e.g., collaborative team, quiet space, fast-paced environment...",
            order_index: 0
          }
        ];
        break;
      default:
        title = assessmentType?.replace(/-/g, " ") || "Assessment";
        mockQuestions = [
          {
            id: "fallback-1",
            assessment_type_id: "fallback",
            question_id: "q1",
            question_type: "single_choice",
            question_text: "This is a sample question for this assessment.",
            options: [
              { text: "Option A", value: "a" },
              { text: "Option B", value: "b" },
              { text: "Option C", value: "c" },
              { text: "Option D", value: "d" }
            ],
            scoring: { a: 1, b: 2, c: 3, d: 4 },
            next_question_logic: [],
            min_selections: 1,
            max_selections: 1,
            order_index: 0
          }
        ];
    }

    setQuestions(mockQuestions);
    setAssessmentTitle(title);
  };

  const handleAnswer = (answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].question_id]: answer
    }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.question_id];
    
    // Check for conditional branching
    if (currentQuestion.next_question_logic && currentQuestion.next_question_logic.length > 0 && currentAnswer) {
      const logic = currentQuestion.next_question_logic.find(
        rule => rule.ifValue === currentAnswer
      );
      
      if (logic) {
        const targetQuestionIndex = questions.findIndex(q => q.question_id === logic.goTo);
        if (targetQuestionIndex !== -1) {
          setCurrentQuestionIndex(targetQuestionIndex);
          return;
        }
      }
    }
    
    // Default: go to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to save your assessment");
        navigate("/auth");
        return;
      }

      // Calculate score based on scoring rules
      let totalScore = 0;
      let maxScore = 0;
      
      questions.forEach(question => {
        const answer = answers[question.question_id];
        if (answer && question.scoring) {
          if (Array.isArray(answer)) {
            // Multi-choice question
            answer.forEach(ans => {
              if (question.scoring[ans]) {
                totalScore += question.scoring[ans];
              }
            });
          } else {
            // Single choice question
            if (question.scoring[answer]) {
              totalScore += question.scoring[answer];
            }
          }
        }
        
        // Calculate max possible score for this question
        if (question.scoring) {
          const scores = Object.values(question.scoring);
          if (question.question_type === 'multi_choice') {
            const maxSelections = Math.min(question.max_selections, question.options.length);
            const topScores = scores.sort((a, b) => b - a).slice(0, maxSelections);
            maxScore += topScores.reduce((sum, score) => sum + score, 0);
          } else {
            maxScore += Math.max(...scores);
          }
        }
      });
      
      const percentageScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
      
      // Get career suggestions based on assessment type and score
      const careerSuggestions = getCareerSuggestions(assessmentType, percentageScore);

      const { error } = await supabase
        .from("assessments")
        .insert({
          user_id: user.id,
          assessment_type: assessmentTitle,
          score: percentageScore,
          results_json: answers,
          career_suggestions: careerSuggestions,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("Assessment completed successfully!");
      navigate("/dashboard?tab=assessments");
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const getCareerSuggestions = (type: string | undefined, score: number): string[] => {
    const baseCareerSuggestions: Record<string, string[]> = {
      "career-aptitude": ["Software Engineer", "Data Analyst", "Project Manager", "Business Analyst"],
      "interest-profiler": ["Healthcare Professional", "Environmental Scientist", "Creative Director", "Social Worker"],
      "personality-assessment": ["Research Scientist", "Counselor", "Marketing Manager", "Financial Advisor"]
    };
    
    const baseSuggestions = baseCareerSuggestions[type || ""] || ["General Career Guidance Recommended"];
    
    // Adjust suggestions based on score
    if (score >= 80) {
      return ["Leadership roles in " + baseSuggestions[0], ...baseSuggestions];
    } else if (score >= 60) {
      return baseSuggestions;
    } else {
      return ["Entry-level positions in " + baseSuggestions[0], "Training programs recommended"];
    }
  };

  const isAnswerValid = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers[currentQuestion.question_id];
    
    if (!answer) return false;
    
    if (currentQuestion.question_type === 'multi_choice') {
      const answerArray = answer as string[];
      return answerArray.length >= currentQuestion.min_selections && 
             answerArray.length <= currentQuestion.max_selections;
    }
    
    if (currentQuestion.question_type === 'text_input') {
      return (answer as string).trim().length > 0;
    }
    
    return true; // single_choice
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading assessment...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg mb-4">Assessment not found or unavailable.</p>
            <Button onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard?tab=assessments")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-2xl font-bold mb-2">{assessmentTitle}</h1>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentQ.question_text}</CardTitle>
            <CardDescription>
              {currentQ.question_type === 'multi_choice' 
                ? `Select ${currentQ.min_selections} to ${currentQ.max_selections} options`
                : currentQ.question_type === 'text_input'
                ? 'Please provide your answer'
                : 'Choose the option that best describes you'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Single Choice */}
            {currentQ.question_type === 'single_choice' && (
              <RadioGroup
                value={answers[currentQ.question_id] as string || ""}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {/* Multi Choice */}
            {currentQ.question_type === 'multi_choice' && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`option-${index}`}
                      checked={(answers[currentQ.question_id] as string[] || []).includes(option.value)}
                      onCheckedChange={(checked) => {
                        const currentAnswers = answers[currentQ.question_id] as string[] || [];
                        if (checked) {
                          if (currentAnswers.length < currentQ.max_selections) {
                            handleAnswer([...currentAnswers, option.value]);
                          }
                        } else {
                          handleAnswer(currentAnswers.filter(a => a !== option.value));
                        }
                      }}
                    />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            
            {/* Text Input */}
            {currentQ.question_type === 'text_input' && (
              <Textarea
                placeholder={currentQ.placeholder || "Enter your answer..."}
                value={answers[currentQ.question_id] as string || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                className="min-h-[100px]"
              />
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isAnswerValid() || submitting}
                  variant="hero"
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
                  disabled={!isAnswerValid()}
                  variant="default"
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