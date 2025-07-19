import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut, Globe } from "lucide-react";

interface DashboardHeaderProps {
  user: User;
  onSignOut: () => void;
}

export const DashboardHeader = ({ user, onSignOut }: DashboardHeaderProps) => {
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Career Craft
          </h1>
          <span className="text-sm text-muted-foreground">
            Welcome, {user.user_metadata?.name || user.email}!
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Globe className="h-4 w-4 mr-2" />
            EN / हिंदी
          </Button>
          
          <Button onClick={onSignOut} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};