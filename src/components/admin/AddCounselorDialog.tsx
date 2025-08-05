import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeInput } from "@/lib/auth";

interface AddCounselorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCounselorAdded: () => void;
}

export const AddCounselorDialog = ({ open, onOpenChange, onCounselorAdded }: AddCounselorDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    experience_years: "",
    rate_per_session: "",
    photo_url: "",
    password: ""
  });
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      const sanitizedName = sanitizeInput(formData.name.trim());
      const sanitizedEmail = sanitizeInput(formData.email.trim());
      const sanitizedBio = sanitizeInput(formData.bio.trim());
      
      if (sanitizedName.length < 2) throw new Error("Name must be at least 2 characters");
      if (!sanitizedEmail.includes("@")) throw new Error("Please enter a valid email");
      if (formData.password.length < 6) throw new Error("Password must be at least 6 characters");
      if (parseInt(formData.experience_years) < 0) throw new Error("Experience years cannot be negative");

      // Check if user already exists
      const { data: existingUser } = await supabase.auth.getUser();
      
      // Create user account for counselor
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/counselor/auth`
        }
      });

      // Handle case where user already exists
      if (authError && authError.message === "User already registered") {
        // Get the existing user ID by email (admin has access to this)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('email', sanitizedEmail)
          .single();
        
        if (!profiles) {
          throw new Error("User with this email already exists but profile not found");
        }

        // Use existing user's ID
        const userId = profiles.user_id;

        // Add counselor role to existing user
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'counselor'
          });

        if (roleError && !roleError.message.includes('duplicate')) {
          throw roleError;
        }

        // Create counselor profile
        const { error: counselorError } = await supabase
          .from('counselors')
          .insert({
            user_id: userId,
            name: sanitizedName,
            email: sanitizedEmail,
            bio: sanitizedBio,
            experience_years: parseInt(formData.experience_years) || 0,
            rate_per_session: parseFloat(formData.rate_per_session) || 0,
            photo_url: formData.photo_url || null,
            specializations: specializations,
            languages: languages,
            is_active: true,
            rating: 0,
            total_sessions: 0
          });

        if (counselorError) throw counselorError;
      } else {
        // Handle other auth errors
        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create user account");

        // Add counselor role to new user
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'counselor'
          });

        if (roleError) throw roleError;

        // Create counselor profile
        const { error: counselorError } = await supabase
          .from('counselors')
          .insert({
            user_id: authData.user.id,
            name: sanitizedName,
            email: sanitizedEmail,
            bio: sanitizedBio,
            experience_years: parseInt(formData.experience_years) || 0,
            rate_per_session: parseFloat(formData.rate_per_session) || 0,
            photo_url: formData.photo_url || null,
            specializations: specializations,
            languages: languages,
            is_active: true,
            rating: 0,
            total_sessions: 0
          });

        if (counselorError) throw counselorError;
      }

      toast.success("Counselor added successfully");
      resetForm();
      onOpenChange(false);
      onCounselorAdded();
    } catch (error: any) {
      console.error("Error adding counselor:", error);
      toast.error(error.message || "Failed to add counselor");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      bio: "",
      experience_years: "",
      rate_per_session: "",
      photo_url: "",
      password: ""
    });
    setSpecializations([]);
    setLanguages(["English"]);
    setNewSpecialization("");
    setNewLanguage("");
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !specializations.includes(newSpecialization.trim())) {
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (spec: string) => {
    setSpecializations(specializations.filter(s => s !== spec));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (lang: string) => {
    if (languages.length > 1) {
      setLanguages(languages.filter(l => l !== lang));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Counselor</DialogTitle>
          <DialogDescription>
            Create a new counselor profile with login credentials
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. John Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief description of the counselor's background and expertise..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (Years)</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                placeholder="5"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Rate per Session</Label>
              <Input
                id="rate"
                type="number"
                value={formData.rate_per_session}
                onChange={(e) => setFormData({ ...formData, rate_per_session: e.target.value })}
                placeholder="100"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Photo URL</Label>
            <Input
              id="photo"
              value={formData.photo_url}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label>Specializations</Label>
            <div className="flex gap-2">
              <Input
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                placeholder="e.g., Career Transition"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
              />
              <Button type="button" variant="outline" onClick={addSpecialization}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {spec}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeSpecialization(spec)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Languages</Label>
            <div className="flex gap-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="e.g., Spanish"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
              />
              <Button type="button" variant="outline" onClick={addLanguage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {lang}
                  {languages.length > 1 && (
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeLanguage(lang)}
                    />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Counselor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};