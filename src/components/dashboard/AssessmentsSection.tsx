import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Brain, TrendingUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AssessmentsSectionProps {
  user: User;
}

interface Assessment {
  id: string;
  assessment_type: string;
  completed_at: string;
  score: number;
  career_suggestions: string[];
  counselor_interpretation_notes?: string;
  results_json: any;
}

interface AssessmentType {
  id: string;
  name: string;
  description: string;
  estimated_duration: string;
  is_active: boolean;
}

export const AssessmentsSection = ({ user }: AssessmentsSectionProps) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();
    fetchAssessmentTypes();
  }, [user.id]);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) throw error;

      setAssessments(data || []);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessmentTypes = async () => {
    try {
      // Use any to bypass TypeScript errors until types are regenerated
      const { data, error } = await (supabase as any)
        .from("assessment_types")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAssessmentTypes(data || []);
    } catch (error) {
      console.error("Error fetching assessment types:", error);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="default">Excellent</Badge>;
    if (score >= 60) return <Badge variant="secondary">Good</Badge>;
    if (score >= 40) return <Badge variant="outline">Average</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  // Default assessments if no custom ones are available
  const defaultAssessments = [
    {
      id: "career-aptitude",
      name: "Career Aptitude Test",
      description: "Discover your natural talents and abilities across different career domains.",
      estimated_duration: "20-30 minutes",
      icon: Brain
    },
    {
      id: "interest-profiler",
      name: "Interest Profiler",
      description: "Identify what truly motivates and interests you in potential career paths.",
      estimated_duration: "15-20 minutes",
      icon: TrendingUp
    },
    {
      id: "personality-assessment",
      name: "Personality Assessment",
      description: "Understand your personality type and how it relates to career success.",
      estimated_duration: "25-35 minutes",
      icon: FileText
    }
  ];

  const availableAssessments = assessmentTypes.length > 0 
    ? assessmentTypes.map(type => ({
        id: type.name.toLowerCase().replace(/\s+/g, '-'),
        name: type.name,
        description: type.description,
        estimated_duration: type.estimated_duration,
        icon: FileText
      }))
    : defaultAssessments;

  const handleStartAssessment = (assessmentId: string) => {
    navigate(`/assessment/${assessmentId}`);
  };

  const handleTakeAssessment = () => {
    // Navigate to first available assessment
    if (availableAssessments.length > 0) {
      navigate(`/assessment/${availableAssessments[0].id}`);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading assessments...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Assessments</h2>
        <p className="text-muted-foreground">
          Track your career assessment results and insights
        </p>
      </div>

      {/* Take New Assessment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Take a New Assessment
          </CardTitle>
          <CardDescription>
            Discover more about yourself with our scientifically validated assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableAssessments.map((assessment) => {
              const Icon = assessment.icon;
              const hasCompleted = assessments.some(a => 
                a.assessment_type.toLowerCase().includes(assessment.name.toLowerCase()) ||
                a.assessment_type.toLowerCase().includes(assessment.id.split('-')[0])
              );
              
              return (
                <Card key={assessment.id} className="border-2 hover:border-primary/20 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-sm">{assessment.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">{assessment.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{assessment.estimated_duration}</span>
                      {hasCompleted ? (
                        <Badge variant="secondary">Completed</Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStartAssessment(assessment.id)}
                        >
                          Start
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Completed Assessments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Completed Assessments</h3>
        
        {assessments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No assessments completed yet</p>
                <p className="text-sm mb-4">Take your first assessment to discover your career potential!</p>
                <Button onClick={handleTakeAssessment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Take Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          assessments.map((assessment) => (
            <Card key={assessment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{assessment.assessment_type}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4" />
                      Completed on {format(new Date(assessment.completed_at), "PPP")}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {assessment.score && getScoreBadge(assessment.score)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessment.score && (
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Overall Score</span>
                      <span className="text-2xl font-bold text-primary">{assessment.score}%</span>
                    </div>
                  </div>
                )}
                
                {assessment.career_suggestions && assessment.career_suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Career Suggestions:</h4>
                    <div className="flex flex-wrap gap-2">
                      {assessment.career_suggestions.map((suggestion, index) => (
                        <Badge key={index} variant="outline">{suggestion}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {assessment.counselor_interpretation_notes && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Counselor's Interpretation:</h4>
                    <p className="text-sm text-muted-foreground">
                      {assessment.counselor_interpretation_notes}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Full Report
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => navigate('/dashboard?tab=booking')}
                  >
                    Discuss with Counselor
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};