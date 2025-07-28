import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Download,
  Search,
  UserCheck,
  Star,
  Clock,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalyticsData {
  growth: Record<string, number>;
  sales: Record<string, number>;
  outreach: Record<string, number>;
}

interface UserMetrics {
  name: string;
  email: string;
  assessments_completed: number;
  sessions_booked: number;
  last_login: string;
  total_logins: number;
  created_at: string;
}

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    growth: {},
    sales: {},
    outreach: {}
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserMetrics[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
    fetchUserMetrics();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("analytics_metrics")
        .select("*");

      if (error) throw error;

      const organized = data.reduce((acc: any, metric: any) => {
        if (!acc[metric.metric_type]) acc[metric.metric_type] = {};
        acc[metric.metric_type][metric.metric_name] = metric.metric_value;
        return acc;
      }, {});

      setAnalyticsData(organized);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMetrics = async () => {
    try {
      // Fetch profiles with aggregated data
      const { data: profiles, error: profilesError } = await (supabase as any)
        .from("profiles")
        .select(`
          name,
          email,
          created_at,
          user_id
        `);

      if (profilesError) throw profilesError;

      // Mock additional metrics for demonstration
      const enrichedUsers = profiles.map((profile: any) => ({
        ...profile,
        assessments_completed: Math.floor(Math.random() * 5),
        sessions_booked: Math.floor(Math.random() * 8),
        last_login: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        total_logins: Math.floor(Math.random() * 50) + 1
      }));

      setUsers(enrichedUsers);
    } catch (error) {
      console.error("Error fetching user metrics:", error);
      toast.error("Failed to fetch user metrics");
    }
  };

  const downloadCSV = (category: string) => {
    const data = analyticsData[category as keyof AnalyticsData];
    if (!data) return;

    const csvContent = "data:text/csv;charset=utf-8," + 
      "Metric,Value\n" +
      Object.entries(data).map(([key, value]) => `${key},${value}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${category}_metrics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${category} data downloaded successfully`);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const growthChartData = [
    { name: 'Jan', users: 850 },
    { name: 'Feb', users: 950 },
    { name: 'Mar', users: 1100 },
    { name: 'Apr', users: 1250 },
  ];

  const sessionsChartData = [
    { name: 'Mon', sessions: 12 },
    { name: 'Tue', sessions: 19 },
    { name: 'Wed', sessions: 15 },
    { name: 'Thu', sessions: 25 },
    { name: 'Fri', sessions: 22 },
    { name: 'Sat', sessions: 18 },
    { name: 'Sun', sessions: 8 },
  ];

  const pieData = [
    { name: 'Career Aptitude', value: 35, color: 'hsl(var(--primary))' },
    { name: 'Interest Profiler', value: 40, color: 'hsl(var(--secondary))' },
    { name: 'Personality', value: 25, color: 'hsl(var(--accent))' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview Metrics</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="individual">Individual Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Company Growth */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Company Growth
                </CardTitle>
                <CardDescription>User registration and engagement metrics</CardDescription>
              </div>
              <Button variant="outline" onClick={() => downloadCSV('growth')}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{analyticsData.growth.total_users || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">New Today</p>
                  <p className="text-2xl font-bold text-green-600">{analyticsData.growth.new_registrations_today || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Active Users (30d)</p>
                  <p className="text-2xl font-bold">{analyticsData.growth.active_users_30d || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Retention Rate</p>
                  <p className="text-2xl font-bold">{analyticsData.growth.retention_rate_30d || 0}%</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales Metrics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Sales Metrics
                </CardTitle>
                <CardDescription>Session bookings and revenue data</CardDescription>
              </div>
              <Button variant="outline" onClick={() => downloadCSV('sales')}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{analyticsData.sales.total_sessions_booked || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold text-blue-600">{analyticsData.sales.sessions_today || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${analyticsData.sales.revenue_total || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Avg Price</p>
                  <p className="text-2xl font-bold">${analyticsData.sales.average_session_price || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Conversion</p>
                  <p className="text-2xl font-bold">{analyticsData.sales.conversion_rate || 0}%</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sessionsChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Outreach Metrics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Outreach Metrics
                </CardTitle>
                <CardDescription>Website traffic and lead generation</CardDescription>
              </div>
              <Button variant="outline" onClick={() => downloadCSV('outreach')}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Website Visitors Today</p>
                  <p className="text-2xl font-bold">{analyticsData.outreach.website_visitors_today || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Leads Generated</p>
                  <p className="text-2xl font-bold">{analyticsData.outreach.leads_generated || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Cumulative User Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Active Users</span>
                  <span className="font-semibold">{users.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assessment Completion Rate</span>
                  <span className="font-semibold">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Sessions per User</span>
                  <span className="font-semibold">2.3</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Counselor Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Counselors</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.8</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sessions Conducted</span>
                  <span className="font-semibold">3,420</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assessment Popularity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Popularity</CardTitle>
              <CardDescription>Distribution of completed assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          {/* Individual Student Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Individual Student Metrics
              </CardTitle>
              <CardDescription>Search and view detailed metrics for specific students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search by student name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.email}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant="outline">{user.assessments_completed} assessments</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected User Details */}
          {selectedUser && (
            <Card>
              <CardHeader>
                <CardTitle>Student Details: {selectedUser.name}</CardTitle>
                <CardDescription>{selectedUser.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Personal Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registration Date</span>
                        <span>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Login</span>
                        <span>{new Date(selectedUser.last_login).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Logins</span>
                        <span>{selectedUser.total_logins}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Activity Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assessments Completed</span>
                        <span>{selectedUser.assessments_completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sessions Booked</span>
                        <span>{selectedUser.sessions_booked}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Completed Career Aptitude Test - 2 days ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Booked session with Sarah Johnson - 1 week ago</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;