import { Button } from "@/components/ui/button";
import { 
  Home, 
  User, 
  Calendar, 
  FileText, 
  BookOpen, 
  Bell, 
  TrendingUp, 
  Plus,
  History
} from "lucide-react";

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "history", label: "History", icon: History },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "booking", label: "Book Session", icon: Plus },
  { id: "profile", label: "My Profile", icon: User },
  { id: "assessments", label: "Assessments", icon: FileText },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "progress", label: "Progress", icon: TrendingUp },
];

export const DashboardSidebar = ({ activeSection, onSectionChange }: DashboardSidebarProps) => {
  return (
    <aside className="w-64 bg-background/50 backdrop-blur border-r min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
};