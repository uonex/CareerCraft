import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Star, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CounselorProfileProps {
  counselor: any;
  user: any;
  onUpdate: (data: any) => void;
}

export const CounselorProfile = ({ counselor, user, onUpdate }: CounselorProfileProps) => {
  const [formData, setFormData] = useState({
    name: counselor.name || '',
    bio: counselor.bio || '',
    specializations: counselor.specializations?.join(', ') || '',
    languages: counselor.languages?.join(', ') || '',
    experience_years: counselor.experience_years || 0,
    rate_per_session: counselor.rate_per_session || 0
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('counselors')
        .update({
          name: formData.name,
          bio: formData.bio,
          specializations: formData.specializations.split(',').map(s => s.trim()).filter(s => s),
          languages: formData.languages.split(',').map(s => s.trim()).filter(s => s),
          experience_years: formData.experience_years,
          rate_per_session: formData.rate_per_session
        })
        .eq('id', counselor.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully');
      onUpdate({ ...counselor, ...formData });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">My Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Tell students about your background and approach..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specializations">Specializations (comma-separated)</Label>
              <Input
                id="specializations"
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                placeholder="Career Transition, Technology Careers, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Languages (comma-separated)</Label>
              <Input
                id="languages"
                value={formData.languages}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                placeholder="English, Spanish, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate_per_session">Rate per Session ($)</Label>
                <Input
                  id="rate_per_session"
                  type="number"
                  value={formData.rate_per_session}
                  onChange={(e) => setFormData({ ...formData, rate_per_session: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">{counselor.rating || 0}</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{counselor.total_sessions || 0}</div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Account Details</h3>
              <div className="space-y-2 text-sm">
                <div>Email: {user?.email}</div>
                <div>Member since: {new Date(counselor.created_at).toLocaleDateString()}</div>
                <div>Status: <Badge variant="default">Active</Badge></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};