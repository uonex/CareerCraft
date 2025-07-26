import { Button } from "@/components/ui/button";
import { Globe, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CC</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground">Career Craft</span>
            <span className="text-xs text-muted-foreground -mt-1">Your Career, Your Craft</span>
          </div>
        </div>

        {/* Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-foreground hover:text-primary transition-colors">Home</a>
          <a href="#services" className="text-foreground hover:text-primary transition-colors">Services</a>
          <a href="#counselors" className="text-foreground hover:text-primary transition-colors">Counselors</a>
          <a href="#resources" className="text-foreground hover:text-primary transition-colors">Resources</a>
          <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Language Toggle */}
          <Button variant="ghost" size="sm" className="hidden sm:flex items-center space-x-1">
            <Globe className="w-4 h-4" />
            <span>EN / हिंदी</span>
          </Button>

          {/* CTA Button */}
          <Button variant="hero" size="default" className="hidden sm:inline-flex">
            Book a Session
          </Button>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};