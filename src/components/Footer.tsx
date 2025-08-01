import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { language, t } = useLanguage();
  return (
    <footer className="bg-gradient-hero text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Career Craft</h3>
                <p className="text-white/80 text-sm">{t('footer.tagline')}</p>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li><button onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })} className="text-white/80 hover:text-white transition-colors text-left">{t('footer.aboutUs')}</button></li>
              <li><button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="text-white/80 hover:text-white transition-colors text-left">{t('footer.ourServices')}</button></li>
              <li><button onClick={() => document.getElementById('counselors')?.scrollIntoView({ behavior: 'smooth' })} className="text-white/80 hover:text-white transition-colors text-left">{t('footer.ourCounselors')}</button></li>
              <li><button onClick={() => document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' })} className="text-white/80 hover:text-white transition-colors text-left">{t('footer.resources')}</button></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2">
              <li><button onClick={() => {
                const currentLang = lang || language;
                navigate(`/${currentLang}/auth`);
              }} className="text-white/80 hover:text-white transition-colors text-left">{t('footer.individual')}</button></li>
              <li><button onClick={() => {
                const currentLang = lang || language;
                navigate(`/${currentLang}/auth`);
              }} className="text-white/80 hover:text-white transition-colors text-left">{t('footer.group')}</button></li>
              <li><button onClick={() => {
                const currentLang = lang || language;
                navigate(`/${currentLang}/auth`);
              }} className="text-white/80 hover:text-white transition-colors text-left">{t('footer.assessments')}</button></li>
              <li><button onClick={() => {
                const currentLang = lang || language;
                navigate(`/${currentLang}/auth`);
              }} className="text-white/80 hover:text-white transition-colors text-left">{t('footer.specialized')}</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.contactUs')}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-white/60" />
                <span className="text-white/80">info@careercraft.in</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-white/60" />
                <span className="text-white/80">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-white/60" />
                <span className="text-white/80">Mumbai, Delhi, Bangalore</span>
              </div>
            </div>
            
            {/* Language Support */}
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <h5 className="font-semibold mb-2">{t('footer.supportLanguages')}</h5>
              <div className="flex space-x-4">
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">English</span>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">हिंदी</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-white/80 text-sm">
              {t('footer.rights')}
            </div>
            <div className="flex space-x-6 text-sm">
              <button onClick={() => {
                const currentLang = lang || language;
                navigate(`/${currentLang}/auth`);
              }} className="text-white/80 hover:text-white transition-colors">{t('footer.support')}</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};