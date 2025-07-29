import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, TrendingUp, Plus, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardOverviewProps {
  user: User;
}

interface DashboardStats {
  upcomingSessions: number;
  completedAssessments: number;
  totalSessions: number;
}

const dailyQuotes = [
  {
    text: "Your future is created by what you do today, not tomorrow.",
    author: "Robert Kiyosaki"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "Your career is a journey, not a destination. Enjoy the ride.",
    author: "Career Craft"
  },
  {
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  }
];

export const DashboardOverview = ({ user }: DashboardOverviewProps) => {
  const [stats, setStats] = useState<DashboardStats>({
    upcomingSessions: 0,
    completedAssessments: 0,
    totalSessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [dailyQuote, setDailyQuote] = useState(dailyQuotes[0]);

  useEffect(() => {
    fetchDashboardStats();
    // Set daily quote based on date to ensure it changes daily
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyQuote(dailyQuotes[dayOfYear % dailyQuotes.length]);
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

      {/* Daily Motivational Quote */}
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <Quote className="h-8 w-8 text-primary mx-auto mb-4" />
          <blockquote className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-relaxed">
            "{dailyQuote.text}"
          </blockquote>
          <cite className="text-lg text-muted-foreground font-medium">
            — {dailyQuote.author}
          </cite>
        </CardContent>
      </Card>

      {/* Book Session Button */}
      <div className="text-center">
        <Button 
          size="lg" 
          variant="hero"
          className="px-8 py-4 text-lg"
          onClick={() => window.location.href = '/dashboard?tab=booking'}
        >
          <Plus className="h-5 w-5 mr-2" />
          Book a Session
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Start your personalized career guidance journey today
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
              <Button 
                className="flex-1"
                onClick={() => window.location.href = '/dashboard?tab=booking'}
              >
                <Plus className="h-4 w-4 mr-2" />
                Book Your First Session
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = '/dashboard?tab=assessments'}
              >
                Take Career Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};