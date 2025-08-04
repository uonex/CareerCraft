import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Calendar, FileText, Star, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CounselorStudentsProps {
  counselor: any;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  education_level?: string;
  preferred_language?: string;
}

interface AssignedStudent {
  student_id: string;
  assigned_at: string;
  is_active: boolean;
  profiles: Student;
}

export const CounselorStudents = ({ counselor }: CounselorStudentsProps) => {
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<AssignedStudent | null>(null);
  const [studentSessions, setStudentSessions] = useState<any[]>([]);
  const [studentAssessments, setStudentAssessments] = useState<any[]>([]);

  useEffect(() => {
    fetchAssignedStudents();
  }, [counselor.id]);

  const fetchAssignedStudents = async () => {
    try {
      // First get the assigned students
      const { data: assignments, error: assignmentError } = await supabase
        .from('counselor_students')
        .select('*')
        .eq('counselor_id', counselor.id)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (assignmentError) throw assignmentError;

      if (!assignments || assignments.length === 0) {
        setStudents([]);
        return;
      }

      // Then get the profiles for those students
      const studentIds = assignments.map(a => a.student_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', studentIds);

      if (profileError) throw profileError;

      // Combine the data
      const studentsWithProfiles = assignments.map(assignment => {
        const profile = profiles?.find(p => p.user_id === assignment.student_id);
        return {
          ...assignment,
          profiles: profile ? {
            id: profile.id,
            name: profile.name || 'Unknown',
            email: profile.email || 'No email',
            phone: profile.phone,
            education_level: profile.education_level,
            preferred_language: profile.preferred_language
          } : {
            id: '',
            name: 'Unknown Student',
            email: 'No email',
            phone: '',
            education_level: '',
            preferred_language: ''
          }
        };
      });

      setStudents(studentsWithProfiles);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentUserId: string) => {
    try {
      // Fetch sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', studentUserId)
        .eq('counselor_id', counselor.id)
        .order('session_date', { ascending: false });

      if (sessionsError) throw sessionsError;
      setStudentSessions(sessions || []);

      // Fetch assessments
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', studentUserId)
        .order('completed_at', { ascending: false });

      if (assessmentsError) throw assessmentsError;
      setStudentAssessments(assessments || []);

    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Failed to load student details');
    }
  };

  const filteredStudents = students.filter(student =>
    student.profiles.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentClick = (student: AssignedStudent) => {
    setSelectedStudent(student);
    fetchStudentDetails(student.student_id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">My Students</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <Card className="lg:col-span-1 bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Assigned Students ({filteredStudents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : (
              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <div
                    key={student.student_id}
                    onClick={() => handleStudentClick(student)}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{student.profiles.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.profiles.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Assigned: {new Date(student.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No students match your search' : 'No students assigned'}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Details */}
        <Card className="lg:col-span-2 bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>
              {selectedStudent ? `${selectedStudent.profiles.name} - Profile & History` : 'Select a Student'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
              <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="sessions">Sessions</TabsTrigger>
                  <TabsTrigger value="assessments">Assessments</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Contact Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedStudent.profiles.email}</span>
                          </div>
                          {selectedStudent.profiles.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{selectedStudent.profiles.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Education & Preferences</h3>
                        <div className="space-y-2">
                          {selectedStudent.profiles.education_level && (
                            <Badge variant="secondary">{selectedStudent.profiles.education_level}</Badge>
                          )}
                          {selectedStudent.profiles.preferred_language && (
                            <Badge variant="outline">{selectedStudent.profiles.preferred_language}</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Quick Stats</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-background/50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-primary">{studentSessions.length}</div>
                          <div className="text-sm text-muted-foreground">Total Sessions</div>
                        </div>
                        <div className="p-3 bg-background/50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-primary">{studentAssessments.length}</div>
                          <div className="text-sm text-muted-foreground">Assessments</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-4">
                  <div className="space-y-3">
                    {studentSessions.map((session) => (
                      <div key={session.id} className="p-4 border rounded-lg bg-background/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{session.session_date} at {session.session_time}</span>
                          </div>
                          <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{session.service_type}</p>
                        {session.notes && (
                          <p className="text-sm bg-muted/50 p-2 rounded">
                            <strong>Student Notes:</strong> {session.notes}
                          </p>
                        )}
                        {session.counselor_notes && (
                          <p className="text-sm bg-primary/5 p-2 rounded mt-2">
                            <strong>Your Notes:</strong> {session.counselor_notes}
                          </p>
                        )}
                      </div>
                    ))}
                    {studentSessions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No sessions recorded
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="assessments" className="space-y-4">
                  <div className="space-y-3">
                    {studentAssessments.map((assessment) => (
                      <div key={assessment.id} className="p-4 border rounded-lg bg-background/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{assessment.assessment_type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {assessment.score && (
                              <Badge variant="outline">{assessment.score}/100</Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {new Date(assessment.completed_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {assessment.career_suggestions && assessment.career_suggestions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Career Suggestions:</p>
                            <div className="flex flex-wrap gap-1">
                              {assessment.career_suggestions.map((suggestion: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {suggestion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {studentAssessments.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No assessments completed
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a student to view their profile and history</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};