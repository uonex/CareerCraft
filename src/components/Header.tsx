import { Button } from "@/components/ui/button";
import { Globe, Menu } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useLanguage } from "@/contexts/LanguageContext";

export const Header = () => {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleNavClick = (section: string) => {
    const currentLang = lang || language;
    // If we're not on the home page, navigate to home first
    if (window.location.pathname !== `/${currentLang}`) {
      navigate(`/${currentLang}`, { state: { scrollTo: section } });
    } else {
      scrollToSection(section);
    }
  };

  const handleBookSession = () => {
    const currentLang = lang || language;
    if (user) {
      navigate(`/${currentLang}/dashboard`, { state: { activeSection: 'booking' } });
    } else {
      navigate(`/${currentLang}/auth`);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate(`/${language}`)}
        >
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
          <button 
            onClick={() => handleNavClick('hero')} 
            className="text-foreground hover:text-primary transition-colors"
          >
            {t('header.home')}
          </button>
          <button 
            onClick={() => handleNavClick('services')} 
            className="text-foreground hover:text-primary transition-colors"
          >
            {t('header.services')}
          </button>
          <button 
            onClick={() => handleNavClick('counselors')} 
            className="text-foreground hover:text-primary transition-colors"
          >
            {t('header.counselors')}
          </button>
          <button 
            onClick={() => handleNavClick('resources')} 
            className="text-foreground hover:text-primary transition-colors"
          >
            {t('header.resources')}
          </button>
          <button 
            onClick={() => handleNavClick('contact')} 
            className="text-foreground hover:text-primary transition-colors"
          >
            {t('header.contact')}
          </button>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Language Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden sm:flex items-center space-x-1"
            onClick={toggleLanguage}
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'en' ? 'EN / हिंदी' : 'हिंदी / EN'}</span>
          </Button>

          {/* User Actions */}
          {user ? (
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/${language}/dashboard`)}
              >
                {t('header.dashboard')}
              </Button>
              <Button 
                variant="hero" 
                size="default" 
                className="hidden sm:inline-flex"
                onClick={handleBookSession}
              >
                {t('header.bookSession')}
              </Button>
            </div>
          ) : (
            <Button 
              variant="hero" 
              size="default" 
              className="hidden sm:inline-flex"
              onClick={handleBookSession}
            >
              {t('header.bookSession')}
            </Button>
          )}

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};