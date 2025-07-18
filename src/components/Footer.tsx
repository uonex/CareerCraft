import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
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
                <p className="text-white/80 text-sm">Your Career, Your Craft</p>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed">
              Empowering students to discover their potential and craft successful careers through personalized guidance and expert counseling.
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
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-white/80 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#services" className="text-white/80 hover:text-white transition-colors">Our Services</a></li>
              <li><a href="#counselors" className="text-white/80 hover:text-white transition-colors">Our Counselors</a></li>
              <li><a href="#assessments" className="text-white/80 hover:text-white transition-colors">Assessments</a></li>
              <li><a href="#resources" className="text-white/80 hover:text-white transition-colors">Resources</a></li>
              <li><a href="#blog" className="text-white/80 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#individual" className="text-white/80 hover:text-white transition-colors">Individual Counseling</a></li>
              <li><a href="#group" className="text-white/80 hover:text-white transition-colors">Group Workshops</a></li>
              <li><a href="#assessments" className="text-white/80 hover:text-white transition-colors">Career Assessments</a></li>
              <li><a href="#specialized" className="text-white/80 hover:text-white transition-colors">Specialized Guidance</a></li>
              <li><a href="#exam-prep" className="text-white/80 hover:text-white transition-colors">Exam Preparation</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
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
              <h5 className="font-semibold mb-2">Support Languages</h5>
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
              © 2024 Career Craft. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#privacy" className="text-white/80 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#terms" className="text-white/80 hover:text-white transition-colors">Terms of Service</a>
              <a href="#support" className="text-white/80 hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};