import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          navigate("/dashboard");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const dateOfBirth = formData.get("date_of_birth") as string;
    const parentGuardianName = formData.get("parent_guardian_name") as string;
    const parentGuardianPhone = formData.get("parent_guardian_phone") as string;
    const educationLevel = formData.get("education_level") as string;
    const preferredLanguage = formData.get("preferred_language") as string;

    // Validate password confirmation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name,
            phone,
            date_of_birth: dateOfBirth,
            parent_guardian_name: parentGuardianName,
            education_level: educationLevel,
            preferred_language: preferredLanguage,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile with all the collected data
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: data.user.id,
            name,
            email,
            phone,
            date_of_birth: dateOfBirth || null,
            parent_guardian_name: parentGuardianName || null,
            parent_guardian_phone: parentGuardianPhone || null,
            education_level: educationLevel || null,
            preferred_language: preferredLanguage || 'en',
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          toast.error("Account created but profile setup failed. Please contact support.");
        } else {
          toast.success("Account created successfully! Please check your email to verify your account.");
        }
      }
    } catch (error: any) {
      if (error.message.includes("User already registered")) {
        toast.error("An account with this email already exists. Please sign in instead.");
      } else {
        toast.error(error.message || "An error occurred during sign up");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in, redirect
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to Career Craft
          </CardTitle>
          <CardDescription>
            Your journey to crafting the perfect career starts here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name *</Label>
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-dob">Date of Birth *</Label>
                  <Input
                    id="signup-dob"
                    name="date_of_birth"
                    type="date"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-father-name">Father's Name</Label>
                  <Input
                    id="signup-father-name"
                    name="parent_guardian_name"
                    type="text"
                    placeholder="Father's full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-mother-name">Mother's Name</Label>
                  <Input
                    id="signup-mother-name"
                    name="mother_name"
                    type="text"
                    placeholder="Mother's full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-education">Educational Background</Label>
                  <Input
                    id="signup-education"
                    name="education_level"
                    type="text"
                    placeholder="e.g., 12th Grade, Bachelor's in Science, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-language">Language Proficiency</Label>
                  <Input
                    id="signup-language"
                    name="preferred_language"
                    type="text"
                    placeholder="e.g., English, Hindi, Tamil"
                    defaultValue="English, Hindi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email Address *</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <Input
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-parent-phone">Parent/Guardian Phone</Label>
                  <Input
                    id="signup-parent-phone"
                    name="parent_guardian_phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password *</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                  <Input
                    id="signup-confirm-password"
                    name="confirm_password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    required
                    className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the Terms and Conditions and Privacy Policy *
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground"
            >
              ← Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;