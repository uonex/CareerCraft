import { Button } from "@/components/ui/button";
import { 
  Home, 
  User, 
  Calendar, 
  FileText, 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Plus,
  HelpCircle
} from "lucide-react";

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "profile", label: "My Profile", icon: User },
  { id: "sessions", label: "My Sessions", icon: Calendar },
  { id: "assessments", label: "My Assessments", icon: FileText },
  { id: "resources", label: "Recommended Resources", icon: BookOpen },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "progress", label: "Progress Tracker", icon: TrendingUp },
  { id: "booking", label: "Book New Session", icon: Plus },
  { id: "help", label: "Help & Support", icon: HelpCircle },
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