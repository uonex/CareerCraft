import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract language from URL or use stored preference
  const getInitialLanguage = (): Language => {
    const pathLang = location.pathname.split('/')[1];
    if (pathLang === 'en' || pathLang === 'hi') {
      return pathLang;
    }
    
    // Check localStorage
    const stored = localStorage.getItem('language') as Language;
    if (stored === 'en' || stored === 'hi') {
      return stored;
    }
    
    return 'en'; // Default to English
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Update URL to include language prefix
    const currentPath = location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(?:en|hi)/, '') || '/';
    const newPath = `/${lang}${pathWithoutLang}`;
    
    navigate(newPath, { replace: true });
  };

  // Update language when URL changes
  useEffect(() => {
    const pathLang = location.pathname.split('/')[1];
    if ((pathLang === 'en' || pathLang === 'hi') && pathLang !== language) {
      setLanguageState(pathLang);
      localStorage.setItem('language', pathLang);
    }
  }, [location.pathname, language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Translation data
const translations = {
  en: {
    // Header
    'header.home': 'Home',
    'header.services': 'Services', 
    'header.counselors': 'Counselors',
    'header.resources': 'Resources',
    'header.contact': 'Contact',
    'header.dashboard': 'Dashboard',
    'header.bookSession': 'Book a Session',
    
    // Hero Section
    'hero.title1': 'Your Career',
    'hero.title2': 'Your Craft',
    'hero.subtitle': 'Discover your passion, unlock your potential, and craft a successful career with personalized guidance from expert counselors.',
    'hero.cta': 'Start Your Journey',
    'hero.students': 'Happy Students',
    'hero.support': '24/7 Support',
    'hero.scrollDown': 'Scroll down to explore',
    
    // Why Career Craft
    'why.title': 'Why Choose',
    'why.titleHighlight': 'Career Craft?',
    'why.subtitle': 'Every student faces the challenge of choosing the right career path.',
    'why.description': 'We understand the confusion, the pressure from family and society, and the fear of making the wrong choice. That\'s why we\'re here to guide you every step of the way.',
    'why.cta': 'Get Personalized Guidance',
    
    // Features
    'feature.personalized.title': 'Personalized Career Guidance',
    'feature.personalized.desc': 'Get tailored advice based on your interests, skills, and goals',
    'feature.expert.title': 'Expert Counselors',
    'feature.expert.desc': 'Learn from certified professionals with years of experience',
    'feature.bilingual.title': 'Bilingual Support',
    'feature.bilingual.desc': 'Comfortable counseling in both English and Hindi',
    'feature.convenient.title': 'Convenient Online Sessions',
    'feature.convenient.desc': 'Flexible scheduling that fits your busy student life',
    'feature.assessments.title': 'Comprehensive Assessments',
    'feature.assessments.desc': 'Detailed evaluations to understand your strengths and interests',
    'feature.affordable.title': 'Affordable Pricing',
    'feature.affordable.desc': 'Quality guidance that doesn\'t break the bank',
    
    // How It Works
    'howit.title': 'How It Works',
    'howit.subtitle': 'Three simple steps to discover your perfect career path',
    'howit.step1.title': 'Take Assessment',
    'howit.step1.desc': 'Complete our comprehensive career assessment',
    'howit.step1.details': 'Answer questions about your interests, values, and skills',
    'howit.step2.title': 'Get Matched',
    'howit.step2.desc': 'We match you with the perfect counselor',
    'howit.step2.details': 'Based on your assessment and preferences',
    'howit.step3.title': 'Start Journey',
    'howit.step3.desc': 'Begin your personalized career guidance',
    'howit.step3.details': 'Work with your counselor to achieve your goals',
    'howit.cta': 'Start Your Assessment',
    
    // Testimonials
    'testimonials.title': 'Student',
    'testimonials.titleHighlight': 'Success Stories',
    'testimonials.subtitle': 'Real students, real transformations. See how Career Craft has helped thousands find their perfect career path.',
    'testimonials.cta': 'Ready to write your own success story?',
    
    // Stats
    'stats.studentsGuided': 'Students Guided',
    'stats.satisfaction': 'Satisfaction Rate',
    'stats.counselors': 'Expert Counselors',
    'stats.languages': 'Languages Supported',
    
    // Featured Counselors
    'counselors.title': 'Meet Our',
    'counselors.titleHighlight': 'Expert Counselors',
    'counselors.subtitle': 'Get guidance from certified professionals who understand the Indian education system and career landscape.',
    'counselors.bookSession': 'Book Session',
    'counselors.experience': 'Years Experience',
    'counselors.clients': 'Happy Clients',
    'counselors.languages': 'Languages',
    'counselors.expertise': 'Expertise',
    
    // Interactive Quiz
    'quiz.title': 'Discover Your',
    'quiz.titleHighlight': 'Career Personality',
    'quiz.subtitle': 'Take our quick personality quiz to get instant career suggestions tailored to your unique traits.',
    'quiz.progress': 'Question',
    'quiz.of': 'of',
    'quiz.result.title': 'Your Career Personality',
    'quiz.result.matches': 'Career Matches',
    'quiz.result.getAssessment': 'Get Detailed Assessment',
    'quiz.result.retake': 'Retake Quiz',
    'quiz.cta.title': 'Want a Professional Assessment?',
    'quiz.cta.desc': 'Get detailed insights from our expert counselors',
    'quiz.cta.button': 'Schedule Assessment',
    
    // Motivational Quotes
    'quotes.title': 'Daily',
    'quotes.titleHighlight': 'Motivation',
    'quotes.subtitle': 'Inspiring words to fuel your career journey',
    'quotes.cta.title': 'Ready to Start Your Journey?',
    'quotes.cta.desc': 'Take the first step towards your dream career today',
    'quotes.cta.button': 'Begin Your Assessment',
    
    // Footer
    'footer.tagline': 'Your Career, Your Craft',
    'footer.description': 'Empowering students to discover their potential and craft successful careers through personalized guidance and expert counseling.',
    'footer.quickLinks': 'Quick Links',
    'footer.aboutUs': 'About Us',
    'footer.ourServices': 'Our Services',
    'footer.ourCounselors': 'Our Counselors',
    'footer.resources': 'Resources',
    'footer.services': 'Services',
    'footer.individual': 'Individual Counseling',
    'footer.group': 'Group Workshops',
    'footer.assessments': 'Career Assessments',
    'footer.specialized': 'Specialized Guidance',
    'footer.contactUs': 'Contact Us',
    'footer.supportLanguages': 'Support Languages',
    'footer.rights': '© 2024 Career Craft. All rights reserved.',
    'footer.support': 'Contact Support',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.tryAgain': 'Try Again',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No'
  },
  hi: {
    // Header
    'header.home': 'होम',
    'header.services': 'सेवाएं',
    'header.counselors': 'सलाहकार',
    'header.resources': 'संसाधन',
    'header.contact': 'संपर्क',
    'header.dashboard': 'डैशबोर्ड',
    'header.bookSession': 'सत्र बुक करें',
    
    // Hero Section
    'hero.title1': 'आपका करियर',
    'hero.title2': 'आपकी कला',
    'hero.subtitle': 'अपने जुनून की खोज करें, अपनी क्षमता को उजागर करें, और विशेषज्ञ सलाहकारों से व्यक्तिगत मार्गदर्शन के साथ एक सफल करियर बनाएं।',
    'hero.cta': 'अपनी यात्रा शुरू करें',
    'hero.students': 'खुश छात्र',
    'hero.support': '24/7 सहायता',
    'hero.scrollDown': 'अन्वेषण के लिए नीचे स्क्रॉल करें',
    
    // Why Career Craft
    'why.title': 'क्यों चुनें',
    'why.titleHighlight': 'Career Craft?',
    'why.subtitle': 'हर छात्र को सही करियर पथ चुनने की चुनौती का सामना करना पड़ता है।',
    'why.description': 'हम भ्रम, परिवार और समाज के दबाव, और गलत विकल्प बनाने के डर को समझते हैं। इसीलिए हम यहां हैं आपको हर कदम पर मार्गदर्शन देने के लिए।',
    'why.cta': 'व्यक्तिगत मार्गदर्शन प्राप्त करें',
    
    // Features
    'feature.personalized.title': 'व्यक्तिगत करियर मार्गदर्शन',
    'feature.personalized.desc': 'अपनी रुचियों, कौशल और लक्ष्यों के आधार पर अनुकूलित सलाह प्राप्त करें',
    'feature.expert.title': 'विशेषज्ञ सलाहकार',
    'feature.expert.desc': 'वर्षों के अनुभव वाले प्रमाणित पेशेवरों से सीखें',
    'feature.bilingual.title': 'द्विभाषी सहायता',
    'feature.bilingual.desc': 'अंग्रेजी और हिंदी दोनों में आरामदायक परामर्श',
    'feature.convenient.title': 'सुविधाजनक ऑनलाइन सत्र',
    'feature.convenient.desc': 'लचीला शेड्यूलिंग जो आपके व्यस्त छात्र जीवन में फिट बैठता है',
    'feature.assessments.title': 'व्यापक मूल्यांकन',
    'feature.assessments.desc': 'आपकी शक्तियों और रुचियों को समझने के लिए विस्तृत मूल्यांकन',
    'feature.affordable.title': 'किफायती मूल्य',
    'feature.affordable.desc': 'गुणवत्तापूर्ण मार्गदर्शन जो बजट में हो',
    
    // How It Works
    'howit.title': 'यह कैसे काम करता है',
    'howit.subtitle': 'अपने परफेक्ट करियर पथ की खोज के लिए तीन सरल कदम',
    'howit.step1.title': 'मूल्यांकन लें',
    'howit.step1.desc': 'हमारा व्यापक करियर मूल्यांकन पूरा करें',
    'howit.step1.details': 'अपनी रुचियों, मूल्यों और कौशल के बारे में प्रश्नों के उत्तर दें',
    'howit.step2.title': 'मैच करें',
    'howit.step2.desc': 'हम आपको परफेक्ट सलाहकार से मिलाते हैं',
    'howit.step2.details': 'आपके मूल्यांकन और प्राथमिकताओं के आधार पर',
    'howit.step3.title': 'यात्रा शुरू करें',
    'howit.step3.desc': 'अपना व्यक्तिगत करियर मार्गदर्शन शुरू करें',
    'howit.step3.details': 'अपने लक्ष्यों को हासिल करने के लिए अपने सलाहकार के साथ काम करें',
    'howit.cta': 'अपना मूल्यांकन शुरू करें',
    
    // Testimonials
    'testimonials.title': 'छात्र',
    'testimonials.titleHighlight': 'सफलता की कहानियां',
    'testimonials.subtitle': 'वास्तविक छात्र, वास्तविक परिवर्तन। देखें कि Career Craft ने हजारों को अपना परफेक्ट करियर पथ खोजने में कैसे मदद की है।',
    'testimonials.cta': 'अपनी सफलता की कहानी लिखने के लिए तैयार हैं?',
    
    // Stats
    'stats.studentsGuided': 'छात्रों का मार्गदर्शन',
    'stats.satisfaction': 'संतुष्टि दर',
    'stats.counselors': 'विशेषज्ञ सलाहकार',
    'stats.languages': 'समर्थित भाषाएं',
    
    // Featured Counselors
    'counselors.title': 'मिलें हमारे',
    'counselors.titleHighlight': 'विशेषज्ञ सलाहकारों से',
    'counselors.subtitle': 'प्रमाणित पेशेवरों से मार्गदर्शन प्राप्त करें जो भारतीय शिक्षा प्रणाली और करियर परिदृश्य को समझते हैं।',
    'counselors.bookSession': 'सत्र बुक करें',
    'counselors.experience': 'वर्ष अनुभव',
    'counselors.clients': 'खुश ग्राहक',
    'counselors.languages': 'भाषाएं',
    'counselors.expertise': 'विशेषज्ञता',
    
    // Interactive Quiz
    'quiz.title': 'अपने',
    'quiz.titleHighlight': 'करियर व्यक्तित्व की खोज करें',
    'quiz.subtitle': 'अपने अनूठे गुणों के अनुरूप तत्काल करियर सुझाव पाने के लिए हमारी त्वरित व्यक्तित्व प्रश्नोत्तरी लें।',
    'quiz.progress': 'प्रश्न',
    'quiz.of': 'का',
    'quiz.result.title': 'आपका करियर व्यक्तित्व',
    'quiz.result.matches': 'करियर मैच',
    'quiz.result.getAssessment': 'विस्तृत मूल्यांकन प्राप्त करें',
    'quiz.result.retake': 'प्रश्नोत्तरी फिर से लें',
    'quiz.cta.title': 'एक पेशेवर मूल्यांकन चाहते हैं?',
    'quiz.cta.desc': 'हमारे विशेषज्ञ सलाहकारों से विस्तृत जानकारी प्राप्त करें',
    'quiz.cta.button': 'मूल्यांकन शेड्यूल करें',
    
    // Motivational Quotes
    'quotes.title': 'दैनिक',
    'quotes.titleHighlight': 'प्रेरणा',
    'quotes.subtitle': 'आपकी करियर यात्रा को बढ़ावा देने वाले प्रेरणादायक शब्द',
    'quotes.cta.title': 'अपनी यात्रा शुरू करने के लिए तैयार हैं?',
    'quotes.cta.desc': 'आज ही अपने सपनों के करियर की दिशा में पहला कदम उठाएं',
    'quotes.cta.button': 'अपना मूल्यांकन शुरू करें',
    
    // Footer
    'footer.tagline': 'आपका करियर, आपकी कला',
    'footer.description': 'व्यक्तिगत मार्गदर्शन और विशेषज्ञ परामर्श के माध्यम से छात्रों को अपनी क्षमता खोजने और सफल करियर बनाने के लिए सशक्त बनाना।',
    'footer.quickLinks': 'त्वरित लिंक',
    'footer.aboutUs': 'हमारे बारे में',
    'footer.ourServices': 'हमारी सेवाएं',
    'footer.ourCounselors': 'हमारे सलाहकार',
    'footer.resources': 'संसाधन',
    'footer.services': 'सेवाएं',
    'footer.individual': 'व्यक्तिगत परामर्श',
    'footer.group': 'ग्रुप वर्कशॉप',
    'footer.assessments': 'करियर मूल्यांकन',
    'footer.specialized': 'विशेष मार्गदर्शन',
    'footer.contactUs': 'संपर्क करें',
    'footer.supportLanguages': 'समर्थित भाषाएं',
    'footer.rights': '© 2024 Career Craft। सभी अधिकार सुरक्षित।',
    'footer.support': 'संपर्क सहायता',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'कुछ गलत हुआ',
    'common.tryAgain': 'पुनः प्रयास करें',
    'common.submit': 'सबमिट करें',
    'common.cancel': 'रद्द करें',
    'common.save': 'सेव करें',
    'common.edit': 'संपादित करें',
    'common.delete': 'मिटाएं',
    'common.confirm': 'पुष्टि करें',
    'common.yes': 'हां',
    'common.no': 'नहीं'
  }
};