import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Search, 
  Mail, 
  Trash2, 
  Archive,
  Reply,
  MoreVertical,
  Bug,
  Users,
  Shield,
  RotateCcw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeedbackItem {
  id: string;
  user_id: string;
  counselor_id?: string;
  session_id?: string;
  message: string;
  category: 'technical' | 'social' | 'spam' | 'uncategorized';
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  counselor_name?: string;
}

const AdminFeedback = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    filterFeedback();
  }, [feedbackList, activeCategory, searchQuery]);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("feedback")
        .select(`
          *,
          profiles!feedback_user_id_fkey(name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const enrichedFeedback = data.map((item: any) => ({
        ...item,
        user_name: item.profiles?.name || 'Unknown User',
        user_email: item.profiles?.email || 'No email',
        counselor_name: 'Sarah Johnson' // Mock data
      }));

      setFeedbackList(enrichedFeedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  const filterFeedback = () => {
    let filtered = feedbackList.filter(item => !item.is_deleted);

    if (activeCategory !== 'all') {
      if (activeCategory === 'recycle') {
        filtered = feedbackList.filter(item => item.is_deleted);
      } else {
        filtered = filtered.filter(item => item.category === activeCategory);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.counselor_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFeedback(filtered);
  };

  const updateFeedbackStatus = async (id: string, updates: Partial<FeedbackItem>) => {
    try {
      const { error } = await (supabase as any)
        .from("feedback")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setFeedbackList(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );

      if (selectedFeedback?.id === id) {
        setSelectedFeedback(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
      toast.error("Failed to update feedback");
    }
  };

  const markAsRead = (id: string) => {
    updateFeedbackStatus(id, { is_read: true });
  };

  const markAsUnread = (id: string) => {
    updateFeedbackStatus(id, { is_read: false });
  };

  const categorize = (id: string, category: FeedbackItem['category']) => {
    updateFeedbackStatus(id, { category });
    toast.success(`Feedback moved to ${category} category`);
  };

  const moveToRecycleBin = (id: string) => {
    updateFeedbackStatus(id, { is_deleted: true });
    toast.success("Feedback moved to recycle bin");
  };

  const restoreFromRecycleBin = (id: string) => {
    updateFeedbackStatus(id, { is_deleted: false });
    toast.success("Feedback restored");
  };

  const permanentlyDelete = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from("feedback")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setFeedbackList(prev => prev.filter(item => item.id !== id));
      setSelectedFeedback(null);
      toast.success("Feedback permanently deleted");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Failed to delete feedback");
    }
  };

  const sendReply = () => {
    // In a real implementation, this would send an email
    toast.success(`Reply sent to ${selectedFeedback?.user_email}`);
    setReplyMessage("");
    setReplyDialogOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return Bug;
      case 'social': return Users;
      case 'spam': return Shield;
      case 'recycle': return Trash2;
      default: return MessageSquare;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'destructive';
      case 'social': return 'default';
      case 'spam': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryCounts = () => {
    const counts = {
      all: feedbackList.filter(item => !item.is_deleted).length,
      technical: feedbackList.filter(item => item.category === 'technical' && !item.is_deleted).length,
      social: feedbackList.filter(item => item.category === 'social' && !item.is_deleted).length,
      spam: feedbackList.filter(item => item.category === 'spam' && !item.is_deleted).length,
      recycle: feedbackList.filter(item => item.is_deleted).length
    };
    return counts;
  };

  const counts = getCategoryCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-lg">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback Management
          </CardTitle>
          <CardDescription>
            Manage user feedback in a Gmail-style interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback by user, counselor, or message content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar with Categories */}
            <div className="space-y-4">
              <h3 className="font-semibold">Categories</h3>
              <div className="space-y-2">
                {[
                  { id: 'all', label: 'All Feedback', icon: MessageSquare, count: counts.all },
                  { id: 'technical', label: 'Technical', icon: Bug, count: counts.technical },
                  { id: 'social', label: 'Social', icon: Users, count: counts.social },
                  { id: 'spam', label: 'Spam', icon: Shield, count: counts.spam },
                  { id: 'recycle', label: 'Recycle Bin', icon: Trash2, count: counts.recycle },
                ].map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.label}
                      <Badge variant="secondary" className="ml-auto">
                        {category.count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-2">
              <h3 className="font-semibold">
                {activeCategory === 'all' ? 'All Feedback' : 
                 activeCategory === 'recycle' ? 'Recycle Bin' :
                 activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} 
                ({filteredFeedback.length})
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFeedback?.id === feedback.id 
                        ? 'bg-muted border-primary' 
                        : 'hover:bg-muted/50'
                    } ${!feedback.is_read ? 'border-l-4 border-l-primary' : ''}`}
                    onClick={() => {
                      setSelectedFeedback(feedback);
                      if (!feedback.is_read) {
                        markAsRead(feedback.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-sm ${!feedback.is_read ? 'font-bold' : 'font-medium'}`}>
                            {feedback.user_name}
                          </p>
                          <Badge variant={getCategoryColor(feedback.category) as any} className="text-xs">
                            {feedback.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {feedback.user_email}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {feedback.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredFeedback.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No feedback found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Detail View */}
            <div className="space-y-4">
              {selectedFeedback ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{selectedFeedback.user_name}</CardTitle>
                        <CardDescription>{selectedFeedback.user_email}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => markAsUnread(selectedFeedback.id)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Mark as Unread
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => categorize(selectedFeedback.id, 'technical')}>
                            <Bug className="h-4 w-4 mr-2" />
                            Mark as Technical
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => categorize(selectedFeedback.id, 'social')}>
                            <Users className="h-4 w-4 mr-2" />
                            Mark as Social
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => categorize(selectedFeedback.id, 'spam')}>
                            <Shield className="h-4 w-4 mr-2" />
                            Mark as Spam
                          </DropdownMenuItem>
                          {selectedFeedback.is_deleted ? (
                            <>
                              <DropdownMenuItem onClick={() => restoreFromRecycleBin(selectedFeedback.id)}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restore
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Permanently
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Permanently</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the feedback.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => permanentlyDelete(selectedFeedback.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          ) : (
                            <DropdownMenuItem onClick={() => moveToRecycleBin(selectedFeedback.id)}>
                              <Archive className="h-4 w-4 mr-2" />
                              Move to Recycle Bin
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getCategoryColor(selectedFeedback.category) as any}>
                        {selectedFeedback.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(selectedFeedback.created_at).toLocaleString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedFeedback.counselor_name && (
                        <div>
                          <p className="text-sm font-medium">Counselor:</p>
                          <p className="text-sm text-muted-foreground">{selectedFeedback.counselor_name}</p>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Message:</p>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{selectedFeedback.message}</p>
                        </div>
                      </div>

                      {!selectedFeedback.is_deleted && (
                        <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full">
                              <Reply className="h-4 w-4 mr-2" />
                              Reply to User
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reply to {selectedFeedback.user_name}</DialogTitle>
                              <DialogDescription>
                                Send a reply to {selectedFeedback.user_email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Type your reply here..."
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                rows={4}
                              />
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setReplyDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button onClick={sendReply} disabled={!replyMessage.trim()}>
                                  Send Reply
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a feedback item to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeedback;