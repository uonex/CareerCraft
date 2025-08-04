import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, FileText, Link, Video, Download, Edit, Trash, Search, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CounselorResourcesProps {
  counselor: any;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  external_url: string;
  resource_type: string;
  is_public: boolean;
  created_at: string;
}

export const CounselorResources = ({ counselor }: CounselorResourcesProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file_url: "",
    external_url: "",
    resource_type: "document",
    is_public: false
  });

  useEffect(() => {
    fetchResources();
  }, [counselor.id]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('counselor_resources')
        .select('*')
        .or(`created_by.eq.${counselor.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingResource) {
        // Update existing resource
        const { error } = await supabase
          .from('counselor_resources')
          .update({
            title: formData.title,
            description: formData.description,
            file_url: formData.file_url,
            external_url: formData.external_url,
            resource_type: formData.resource_type,
            is_public: formData.is_public
          })
          .eq('id', editingResource.id);

        if (error) throw error;
        toast.success('Resource updated successfully');
      } else {
        // Create new resource
        const { error } = await supabase
          .from('counselor_resources')
          .insert({
            title: formData.title,
            description: formData.description,
            file_url: formData.file_url,
            external_url: formData.external_url,
            resource_type: formData.resource_type,
            is_public: formData.is_public,
            created_by: counselor.id
          });

        if (error) throw error;
        toast.success('Resource created successfully');
      }

      setIsDialogOpen(false);
      setEditingResource(null);
      setFormData({
        title: "",
        description: "",
        file_url: "",
        external_url: "",
        resource_type: "document",
        is_public: false
      });
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      file_url: resource.file_url,
      external_url: resource.external_url,
      resource_type: resource.resource_type,
      is_public: resource.is_public
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const { error } = await supabase
        .from('counselor_resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;
      toast.success('Resource deleted successfully');
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'link': return <Link className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Resource Library</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Resource title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the resource"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource_type">Resource Type</Label>
                <Select 
                  value={formData.resource_type} 
                  onValueChange={(value) => setFormData({ ...formData, resource_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="link">External Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file_url">File URL (optional)</Label>
                <Input
                  id="file_url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://example.com/file.pdf"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="external_url">External URL (optional)</Label>
                <Input
                  id="external_url"
                  value={formData.external_url}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                />
                <Label htmlFor="is_public">Make available to all counselors</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingResource ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading resources...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="bg-gradient-card border-0 hover:shadow-medium transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getResourceIcon(resource.resource_type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {resource.resource_type}
                        </Badge>
                        {resource.is_public && (
                          <Badge variant="outline" className="text-xs">
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {resource.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {resource.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {resource.file_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(resource.file_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        File
                      </Button>
                    )}
                    {resource.external_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(resource.external_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Link
                      </Button>
                    )}
                  </div>

                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(resource)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Added {new Date(resource.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredResources.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{searchTerm ? 'No resources match your search' : 'No resources available'}</p>
          <p className="text-sm">Add your first resource to get started</p>
        </div>
      )}
    </div>
  );
};