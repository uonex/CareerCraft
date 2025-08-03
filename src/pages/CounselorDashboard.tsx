import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  LogOut, 
  Home, 
  Calendar, 
  Users, 
  BookOpen, 
  User,
  Quote
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface CounselorProfile {
  id: string;
  name: string;
  specializations: string[];
  experience_years: number;
  rating?: number;
  total_sessions?: number;
  bio?: string;
  languages?: string[];
  email?: string;
  availability_json?: any;
  created_at?: string;
  updated_at?: string;
  rate_per_session?: number;
  photo_url?: string;
  is_active?: boolean;
}

const CounselorDashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [counselorProfile, setCounselorProfile] = useState<CounselorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) {
          navigate("/counselor/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuthAndFetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/counselor/login");
        return;
      }

      setUser(session.user);

      // Skip profile fetch for now to avoid TypeScript issues
      // TODO: Implement proper counselor profile fetching
    } catch (error) {
      console.error("Auth check error:", error);
      toast.error("Authentication error");
      navigate("/counselor/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/counselor/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    }
  };

  const motivationalQuotes = [
    "Every student you guide is a future leader in the making.",
    "Your expertise shapes the careers of tomorrow.",
    "Guiding others toward their dreams is the greatest gift you can give.",
    "Today's counseling session could change someone's entire life trajectory."
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading counselor dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Career Craft Counselor</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {counselorProfile?.name || user?.email}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Welcome Card */}
              <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Welcome back, {counselorProfile?.name || "Counselor"}! 👋
                  </CardTitle>
                  <CardDescription>
                    Ready to make a difference in students' careers today?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                    <Quote className="h-8 w-8 text-primary" />
                    <p className="text-lg italic text-foreground">"{randomQuote}"</p>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sessions scheduled for today</p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Quote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent feedback</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Sessions:</span>
                      <span className="font-semibold">{counselorProfile?.total_sessions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="font-semibold">{counselorProfile?.rating || 0}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience:</span>
                      <span className="font-semibold">{counselorProfile?.experience_years || 0} years</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Management</CardTitle>
                <CardDescription>
                  Manage your appointments and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Schedule Management Coming Soon</p>
                  <p>View and manage your sessions, set availability</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>
                  View and manage your assigned students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Student Management Coming Soon</p>
                  <p>Access student profiles, session history, and assessments</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>
                  Access internal documents and materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Resources Coming Soon</p>
                  <p>Internal documents, templates, and reference materials</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>
                  Update your professional details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {counselorProfile ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-2">Basic Information</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-muted-foreground">Name:</span> {counselorProfile.name}</div>
                          <div><span className="text-muted-foreground">Email:</span> {counselorProfile.email || user?.email}</div>
                          <div><span className="text-muted-foreground">Experience:</span> {counselorProfile.experience_years} years</div>
                          <div><span className="text-muted-foreground">Rating:</span> {counselorProfile.rating || 0}/5</div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Specializations</h3>
                        <div className="flex flex-wrap gap-2">
                          {counselorProfile.specializations.map((spec, index) => (
                            <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {counselorProfile.bio && (
                      <div>
                        <h3 className="font-medium mb-2">Bio</h3>
                        <p className="text-sm text-muted-foreground">{counselorProfile.bio}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium mb-2">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {(counselorProfile.languages || ['English']).map((lang, index) => (
                          <span key={index} className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button variant="outline">
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Profile not found</p>
                    <p className="text-sm">Please contact your administrator</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CounselorDashboard;