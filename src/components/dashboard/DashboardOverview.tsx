import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, TrendingUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardOverviewProps {
  user: User;
}

interface DashboardStats {
  upcomingSessions: number;
  completedAssessments: number;
  totalSessions: number;
}

export const DashboardOverview = ({ user }: DashboardOverviewProps) => {
  const [stats, setStats] = useState<DashboardStats>({
    upcomingSessions: 0,
    completedAssessments: 0,
    totalSessions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [user.id]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch upcoming sessions
      const { data: upcomingSessions } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "booked")
        .gte("session_date", new Date().toISOString().split('T')[0]);

      // Fetch completed assessments
      const { data: assessments } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", user.id);

      // Fetch total sessions
      const { data: totalSessions } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id);

      setStats({
        upcomingSessions: upcomingSessions?.length || 0,
        completedAssessments: assessments?.length || 0,
        totalSessions: totalSessions?.length || 0
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user.user_metadata?.name || "Student"}!
        </h2>
        <p className="text-muted-foreground">
          Let's continue crafting your future together.
        </p>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.upcomingSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingSessions > 0 ? "Ready for your next session!" : "Book your first session"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Assessments</CardTitle>
            <FileText className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.completedAssessments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedAssessments > 0 ? "Great insights discovered!" : "Take your first assessment"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sessions completed so far
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Session Card */}
      {stats.upcomingSessions > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Next Session</CardTitle>
            <CardDescription>Don't forget about your upcoming guidance session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Date:</strong> Coming soon
              </p>
              <p className="text-sm">
                <strong>Location:</strong> Career Craft Guidance Center
              </p>
              <Button variant="outline" className="mt-4">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Get Started?</CardTitle>
            <CardDescription>
              Book your first personalized career guidance session with our expert counselors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Book Your First Session
              </Button>
              <Button variant="outline" className="flex-1">
                Take Career Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>Continue your career journey with these next steps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
            <span className="text-sm">Complete your profile for better recommendations</span>
            <Button size="sm" variant="outline">Complete</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg">
            <span className="text-sm">Explore career resources tailored for you</span>
            <Button size="sm" variant="outline">Explore</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
            <span className="text-sm">Connect with your assigned counselor</span>
            <Button size="sm" variant="outline">Message</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};