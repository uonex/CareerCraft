import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, Users, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CounselorHomeProps {
  counselor: any;
  user: any;
}

export const CounselorHome = ({ counselor, user }: CounselorHomeProps) => {
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    todaySessions: 0,
    totalStudents: 0,
    recentFeedback: []
  });
  const [quote, setQuote] = useState("");

  const quotes = [
    "Every career journey is unique, and every step forward is progress.",
    "Your potential is endless. Go do what you were created to do.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Choose a job you love, and you will never have to work a day in your life."
  ];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    fetchDashboardStats();
  }, [counselor.id]);

  const fetchDashboardStats = async () => {
    try {
      // Get upcoming sessions
      const today = new Date().toISOString().split('T')[0];
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('counselor_id', counselor.id)
        .gte('session_date', today);

      if (sessionsError) throw sessionsError;

      const upcomingSessions = sessions?.length || 0;
      const todaySessions = sessions?.filter(s => s.session_date === today).length || 0;

      // Get total students assigned
      const { data: students, error: studentsError } = await supabase
        .from('counselor_students')
        .select('student_id')
        .eq('counselor_id', counselor.id)
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      const totalStudents = students?.length || 0;

      // Get recent feedback
      const { data: feedback, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .eq('counselor_id', counselor.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (feedbackError) throw feedbackError;

      setStats({
        upcomingSessions,
        todaySessions,
        totalStudents,
        recentFeedback: feedback || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-primary text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {counselor.name}!
              </h1>
              <p className="text-white/90">
                Ready to make a difference in someone's career today?
              </p>
            </div>
            <div className="text-6xl opacity-20">
              🌟
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Quote */}
      <Card className="bg-gradient-card border-0">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2 text-foreground">Daily Inspiration</h3>
          <blockquote className="text-muted-foreground italic text-lg">
            "{quote}"
          </blockquote>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Sessions</p>
                <p className="text-2xl font-bold text-foreground">{stats.todaySessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-foreground">{stats.upcomingSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold text-foreground">{counselor.rating || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card className="bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Recent Student Feedback</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentFeedback.length > 0 ? (
            <div className="space-y-4">
              {stats.recentFeedback.map((item: any, index) => (
                <div key={index} className="p-4 bg-background/50 rounded-lg">
                  <p className="text-foreground mb-2">"{item.message}"</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <Badge variant="secondary">{item.category}</Badge>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No recent feedback available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};