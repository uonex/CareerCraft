import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User as UserIcon, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SessionsSectionProps {
  user: User;
}

interface Session {
  id: string;
  service_type: string;
  session_date: string;
  session_time: string;
  status: string;
  location: string;
  rate: number;
  payment_status: string;
  counselor_notes?: string;
  counselors: {
    name: string;
    specializations: string[];
  };
}

export const SessionsSection = ({ user }: SessionsSectionProps) => {
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [user.id]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select(`
          *,
          counselors (
            name,
            specializations
          )
        `)
        .eq("user_id", user.id)
        .order("session_date", { ascending: false });

      if (error) throw error;

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const upcoming = data?.filter(session => {
        const sessionDate = session.session_date;
        return sessionDate >= today && session.status === 'booked';
      }) || [];
      
      const past = data?.filter(session => {
        const sessionDate = session.session_date;
        return sessionDate < today || session.status === 'completed';
      }) || [];

      setUpcomingSessions(upcoming);
      setPastSessions(past);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "booked":
        return <Badge variant="default">Confirmed</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "rescheduled":
        return <Badge variant="outline">Rescheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default">Paid</Badge>;
      case "pending":
        return <Badge variant="outline">Pay at Office</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Sessions</h2>
        <p className="text-muted-foreground">
          View and manage your counseling sessions
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Sessions ({pastSessions.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No upcoming sessions</p>
                  <p className="text-sm mb-4">Book your first session to get started on your career journey!</p>
                  <Button>Book a Session</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            upcomingSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{session.service_type}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <UserIcon className="h-4 w-4" />
                        {session.counselors.name}
                        <span className="text-xs">
                          ({session.counselors.specializations.join(", ")})
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(session.status)}
                      {getPaymentBadge(session.payment_status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{format(new Date(session.session_date), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{session.session_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{session.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-medium">
                      Rate: ₹{session.rate}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                      <Button size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {pastSessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No past sessions yet</p>
                  <p className="text-sm">Your completed sessions will appear here.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            pastSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{session.service_type}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <UserIcon className="h-4 w-4" />
                        {session.counselors.name}
                      </CardDescription>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(session.session_date), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{session.session_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{session.location}</span>
                    </div>
                  </div>
                  
                  {session.counselor_notes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Session Notes:</h4>
                      <p className="text-sm text-muted-foreground">{session.counselor_notes}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Session completed
                    </span>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Summary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};