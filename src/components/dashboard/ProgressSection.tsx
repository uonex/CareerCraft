import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock } from "lucide-react";

interface ProgressSectionProps {
  user: User;
}

const milestones = [
  {
    id: "initial-assessment",
    title: "Initial Assessment",
    description: "Complete your first career assessment",
    completed: false,
    current: true
  },
  {
    id: "first-session",
    title: "First Counseling Session", 
    description: "Meet with your assigned counselor",
    completed: false,
    current: false
  },
  {
    id: "stream-selection",
    title: "Stream Selection",
    description: "Choose your academic stream with guidance",
    completed: false,
    current: false
  },
  {
    id: "college-shortlisting",
    title: "College Shortlisting",
    description: "Identify target colleges and courses",
    completed: false,
    current: false
  },
  {
    id: "application-prep",
    title: "Application Preparation",
    description: "Prepare college applications and documents",
    completed: false,
    current: false
  }
];

export const ProgressSection = ({ user }: ProgressSectionProps) => {
  const completedMilestones = milestones.filter(m => m.completed).length;
  const progressPercentage = (completedMilestones / milestones.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Progress Tracker</h2>
        <p className="text-muted-foreground">
          Track your career guidance journey and milestones
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Career Journey Progress</CardTitle>
          <CardDescription>
            {completedMilestones} of {milestones.length} milestones completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {completedMilestones === 0 
                ? "Start your journey by taking your first assessment!"
                : completedMilestones === milestones.length
                ? "Congratulations! You've completed your career guidance journey!"
                : "You're making great progress! Keep going!"
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Career Milestones</CardTitle>
          <CardDescription>
            Key steps in your career exploration and planning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {milestones.map((milestone, index) => {
              const Icon = milestone.completed 
                ? CheckCircle 
                : milestone.current 
                ? Clock 
                : Circle;
              
              const iconColor = milestone.completed
                ? "text-green-500"
                : milestone.current
                ? "text-primary"
                : "text-muted-foreground";

              return (
                <div key={milestone.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                    {index < milestones.length - 1 && (
                      <div className="w-px h-8 bg-border mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <h3 className={`font-medium ${
                      milestone.completed 
                        ? "text-green-700 dark:text-green-400" 
                        : milestone.current
                        ? "text-primary"
                        : "text-foreground"
                    }`}>
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {milestone.description}
                    </p>
                    {milestone.current && (
                      <div className="mt-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          Current Step
                        </span>
                      </div>
                    )}
                    {milestone.completed && (
                      <div className="mt-2">
                        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                          Completed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>
            Celebrate your progress with these milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-medium">Goal Setter</h3>
              <p className="text-xs text-muted-foreground">Defined career objectives</p>
            </div>
            
            <div className="p-4 border rounded-lg text-center opacity-50">
              <div className="text-2xl mb-2">📚</div>
              <h3 className="font-medium">Knowledge Seeker</h3>
              <p className="text-xs text-muted-foreground">Completed first assessment</p>
            </div>
            
            <div className="p-4 border rounded-lg text-center opacity-50">
              <div className="text-2xl mb-2">🤝</div>
              <h3 className="font-medium">Guidance Embracer</h3>
              <p className="text-xs text-muted-foreground">Attended counseling session</p>
            </div>
            
            <div className="p-4 border rounded-lg text-center opacity-50">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-medium">Future Ready</h3>
              <p className="text-xs text-muted-foreground">Completed journey</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};