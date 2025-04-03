
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { statsApi, jobApi, applicationApi } from "@/services/api";
import { EmployerStats, Job, Application } from "@/types";
import { Plus, Briefcase, Users, Bell } from "lucide-react";
import PostJobForm from "./PostJobForm";
import JobsList from "./JobsList";
import ApplicationsManager from "./ApplicationsManager";

const COLORS = ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE"];

// Mock application status data
const applicationStatusData = [
  { name: "Pending", value: 32 },
  { name: "Reviewed", value: 18 },
  { name: "Interviewed", value: 8 },
  { name: "Offered", value: 5 },
  { name: "Rejected", value: 12 },
];

// Mock application over time data
const applicationsOverTimeData = [
  { date: "Jan", pending: 5, reviewed: 2, interviewed: 1 },
  { date: "Feb", pending: 8, reviewed: 4, interviewed: 2 },
  { date: "Mar", pending: 12, reviewed: 6, interviewed: 3 },
  { date: "Apr", pending: 15, reviewed: 9, interviewed: 4 },
  { date: "May", pending: 20, reviewed: 12, interviewed: 6 },
  { date: "Jun", pending: 25, reviewed: 15, interviewed: 8 },
];

export default function EmployerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<EmployerStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPostJobForm, setShowPostJobForm] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const [employerStats, employerJobs] = await Promise.all([
          statsApi.getEmployerStats(user.id),
          jobApi.getEmployerJobs(user.id)
        ]);
        
        setStats(employerStats);
        setJobs(employerJobs);
        
        // Fetch applications for the first job if available
        if (employerJobs.length > 0) {
          const jobApplications = await applicationApi.getJobApplications(employerJobs[0].id);
          setApplications(jobApplications);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error loading dashboard",
          description: "Could not load your dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, toast]);

  const handleJobCreated = (newJob: Job) => {
    setJobs([newJob, ...jobs]);
    setShowPostJobForm(false);
    toast({
      title: "Job posted",
      description: "Your job listing has been published successfully.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.username}! Manage your job listings and applications.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setShowPostJobForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Post New Job
          </Button>
        </div>
      </div>

      {showPostJobForm && (
        <PostJobForm
          employerId={user?.id || ''}
          onJobCreated={handleJobCreated}
          onCancel={() => setShowPostJobForm(false)}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="py-12 text-center">Loading dashboard data...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Total Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.totalJobs || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Active Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.activeJobs || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Total Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.totalApplications || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Interviewed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.interviewedCandidates || 0}</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                    <CardDescription>Breakdown of application statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={applicationStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {applicationStatusData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Applications Over Time</CardTitle>
                    <CardDescription>Trend of applications received</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={applicationsOverTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="pending" 
                            stroke="#4F46E5"
                            strokeWidth={2}
                            name="Pending" 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="reviewed" 
                            stroke="#F97316" 
                            strokeWidth={2}
                            name="Reviewed" 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="interviewed" 
                            stroke="#10B981" 
                            strokeWidth={2}
                            name="Interviewed" 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recently Posted Jobs</CardTitle>
                  <CardDescription>Your 5 most recent job listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <JobsList 
                    jobs={jobs.slice(0, 5)} 
                    showPagination={false}
                    onJobUpdated={(updatedJob) => {
                      setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job));
                    }}
                    onJobDeleted={(jobId) => {
                      setJobs(jobs.filter(job => job.id !== jobId));
                    }}
                  />
                  
                  {jobs.length > 5 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => setActiveTab("jobs")}>
                        View All Jobs
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <CardTitle>My Jobs</CardTitle>
                  <CardDescription>Manage your job listings</CardDescription>
                </div>
                <Button 
                  onClick={() => setShowPostJobForm(true)} 
                  className="mt-4 md:mt-0"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Post New Job
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center">Loading jobs...</div>
              ) : (
                <JobsList 
                  jobs={jobs} 
                  showPagination={true}
                  onJobUpdated={(updatedJob) => {
                    setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job));
                  }}
                  onJobDeleted={(jobId) => {
                    setJobs(jobs.filter(job => job.id !== jobId));
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications">
          <ApplicationsManager 
            employerId={user?.id || ''} 
            jobs={jobs} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
