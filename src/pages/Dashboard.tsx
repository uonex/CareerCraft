import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { SessionsSection } from "@/components/dashboard/SessionsSection";
import { AssessmentsSection } from "@/components/dashboard/AssessmentsSection";
import { ResourcesSection } from "@/components/dashboard/ResourcesSection";
import { MessagesSection } from "@/components/dashboard/MessagesSection";
import { ProgressSection } from "@/components/dashboard/ProgressSection";
import { BookingSection } from "@/components/dashboard/BookingSection";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error("Error signing out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  if (!user || !session) {
    return null;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview user={user} />;
      case "profile":
        return <ProfileSection user={user} />;
      case "sessions":
        return <SessionsSection user={user} />;
      case "assessments":
        return <AssessmentsSection user={user} />;
      case "resources":
        return <ResourcesSection user={user} />;
      case "messages":
        return <MessagesSection user={user} />;
      case "progress":
        return <ProgressSection user={user} />;
      case "booking":
        return <BookingSection user={user} />;
      default:
        return <DashboardOverview user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <DashboardHeader user={user} onSignOut={handleSignOut} />
      
      <div className="flex">
        <DashboardSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        
        <main className="flex-1 p-6">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;