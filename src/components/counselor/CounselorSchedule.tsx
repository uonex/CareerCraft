import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock, User, MapPin, Edit, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface CounselorScheduleProps {
  counselor: any;
}

interface Session {
  id: string;
  user_id: string;
  session_date: string;
  session_time: string;
  service_type: string;
  status: string;
  notes: string;
  counselor_notes: string;
  location: string;
  profiles?: {
    name: string;
    email: string;
  };
}

export const CounselorSchedule = ({ counselor }: CounselorScheduleProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchAvailability();
  }, [counselor.id]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .eq('counselor_id', counselor.id)
        .order('session_date', { ascending: true })
        .order('session_time', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('counselor_availability')
        .select('*')
        .eq('counselor_id', counselor.id)
        .order('day_of_week');

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const getSessionsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return sessions.filter(session => session.session_date === dateString);
  };

  const updateSessionStatus = async (sessionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status: newStatus })
        .eq('id', sessionId);

      if (error) throw error;
      
      toast.success(`Session ${newStatus} successfully`);
      fetchSessions();
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update session');
    }
  };

  const addCounselorNotes = async (sessionId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ counselor_notes: notes })
        .eq('id', sessionId);

      if (error) throw error;
      
      toast.success('Notes updated successfully');
      fetchSessions();
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'booked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Schedule Management</h2>
        <Button variant="outline">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Export Calendar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1 bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            
            {/* Availability Settings */}
            <div className="mt-6">
              <h3 className="font-semibold mb-4">Weekly Availability</h3>
              <div className="space-y-2">
                {availability.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{dayNames[slot.day_of_week]}</span>
                    <span className="text-muted-foreground">
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>
                ))}
                {availability.length === 0 && (
                  <p className="text-muted-foreground text-sm">No availability set</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card className="lg:col-span-2 bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>
              {selectedDate ? `Sessions for ${format(selectedDate, 'MMMM d, yyyy')}` : 'All Sessions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading sessions...</div>
            ) : (
              <div className="space-y-4">
                {selectedDate && getSessionsForDate(selectedDate).length > 0 ? (
                  getSessionsForDate(selectedDate).map((session) => (
                    <SessionCard 
                      key={session.id} 
                      session={session} 
                      onStatusUpdate={updateSessionStatus}
                      onNotesUpdate={addCounselorNotes}
                    />
                  ))
                ) : selectedDate ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No sessions scheduled for this date
                  </div>
                ) : (
                  sessions.slice(0, 10).map((session) => (
                    <SessionCard 
                      key={session.id} 
                      session={session} 
                      onStatusUpdate={updateSessionStatus}
                      onNotesUpdate={addCounselorNotes}
                    />
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface SessionCardProps {
  session: Session;
  onStatusUpdate: (id: string, status: string) => void;
  onNotesUpdate: (id: string, notes: string) => void;
}

const SessionCard = ({ session, onStatusUpdate, onNotesUpdate }: SessionCardProps) => {
  const [notes, setNotes] = useState(session.counselor_notes || '');
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'booked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveNotes = () => {
    onNotesUpdate(session.id, notes);
    setIsNotesDialogOpen(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-background/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{session.session_time}</span>
            <Badge className={getStatusColor(session.status)}>
              {session.status}
            </Badge>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{session.profiles?.name || 'Unknown Student'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{session.location}</span>
            </div>
            <p className="text-muted-foreground">{session.service_type}</p>
            {session.notes && (
              <p className="text-sm bg-muted/50 p-2 rounded mt-2">
                <strong>Student Notes:</strong> {session.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Select value={session.status} onValueChange={(value) => onStatusUpdate(session.id, value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Session Notes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Label htmlFor="notes">Counselor Notes</Label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-32 p-3 border rounded-lg resize-none"
                    placeholder="Add your notes about this session..."
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveNotes}>
                      Save Notes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};