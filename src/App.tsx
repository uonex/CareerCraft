import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AssessmentTaking from "./pages/AssessmentTaking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <Routes>
            {/* Redirect root to /en */}
            <Route path="/" element={<Navigate to="/en" replace />} />
            
            {/* Language-prefixed routes */}
            <Route path="/:lang" element={<Index />} />
            <Route path="/:lang/auth" element={<Auth />} />
            <Route path="/:lang/dashboard" element={<Dashboard />} />
            <Route path="/:lang/admin" element={<AdminLogin />} />
            <Route path="/:lang/admin/login" element={<AdminLogin />} />
            <Route path="/:lang/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/:lang/assessment/:assessmentType" element={<AssessmentTaking />} />
            
            {/* Fallback routes without language prefix - redirect to /en */}
            <Route path="/auth" element={<Navigate to="/en/auth" replace />} />
            <Route path="/dashboard" element={<Navigate to="/en/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/en/admin" replace />} />
            <Route path="/admin/login" element={<Navigate to="/en/admin/login" replace />} />
            <Route path="/admin/dashboard" element={<Navigate to="/en/admin/dashboard" replace />} />
            <Route path="/assessment/:assessmentType" element={<Navigate to="/en/assessment/:assessmentType" replace />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
