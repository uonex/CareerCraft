import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProfileSectionProps {
  user: User;
}

interface Profile {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  education_level: string;
  preferred_language: string;
  parent_guardian_name: string;
  parent_guardian_phone: string;
}

export const ProfileSection = ({ user }: ProfileSectionProps) => {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    education_level: "",
    preferred_language: "en",
    parent_guardian_name: "",
    parent_guardian_phone: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          date_of_birth: data.date_of_birth || "",
          education_level: data.education_level || "",
          preferred_language: data.preferred_language || "en",
          parent_guardian_name: data.parent_guardian_name || "",
          parent_guardian_phone: data.parent_guardian_phone || ""
        });
      } else {
        // Create initial profile if it doesn't exist
        setProfile(prev => ({
          ...prev,
          name: user.user_metadata?.name || "",
          email: user.email || ""
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...profile
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error("Error updating profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Keep your information up to date for better personalized guidance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={profile.date_of_birth}
                onChange={(e) => setProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="education">Education Level</Label>
              <Select 
                value={profile.education_level} 
                onValueChange={(value) => setProfile(prev => ({ ...prev, education_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class-9">Class 9</SelectItem>
                  <SelectItem value="class-10">Class 10</SelectItem>
                  <SelectItem value="class-11">Class 11</SelectItem>
                  <SelectItem value="class-12">Class 12</SelectItem>
                  <SelectItem value="college-1">1st Year College</SelectItem>
                  <SelectItem value="college-2">2nd Year College</SelectItem>
                  <SelectItem value="college-3">3rd Year College</SelectItem>
                  <SelectItem value="college-4">4th Year College</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select 
                value={profile.preferred_language} 
                onValueChange={(value) => setProfile(prev => ({ ...prev, preferred_language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parent/Guardian Information</CardTitle>
          <CardDescription>
            Optional: For students under 18 or those who want parental involvement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parent-name">Parent/Guardian Name</Label>
              <Input
                id="parent-name"
                value={profile.parent_guardian_name}
                onChange={(e) => setProfile(prev => ({ ...prev, parent_guardian_name: e.target.value }))}
                placeholder="Parent or guardian name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parent-phone">Parent/Guardian Phone</Label>
              <Input
                id="parent-phone"
                type="tel"
                value={profile.parent_guardian_phone}
                onChange={(e) => setProfile(prev => ({ ...prev, parent_guardian_phone: e.target.value }))}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          variant="default"
          size="default"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};