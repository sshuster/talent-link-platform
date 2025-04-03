
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { statsApi, applicationApi, resumeApi } from "@/services/api";
import { SeekerStats, Application, Resume } from "@/types";
import { Plus, Upload, FileText } from "lucide-react";
import JobSearch from "./JobSearch";
import ResumeUploader from "./ResumeUploader";
import ApplicationsList from "./ApplicationsList";

const COLORS = ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE"];

export default function SeekerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<SeekerStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showResumeUploader, setShowResumeUploader] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const [userStats, userApplications, userResumes] = await Promise.all([
          statsApi.getSeekerStats(user.id),
          applicationApi.getApplications(user.id),
          resumeApi.getUserResumes(user.id)
        ]);
        
        setStats(userStats);
        setApplications(userApplications);
        setResumes(userResumes);
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

  const handleResumeUpload = async (newResume: Resume) => {
    setResumes([...resumes, newResume]);
    setShowResumeUploader(false);
    toast({
      title: "Resume uploaded",
      description: "Your resume has been successfully uploaded.",
    });
  };

  // Data for application status chart
  const applicationChartData = stats
    ? [
        { name: "Pending", value: stats.pendingApplications },
        { name: "Reviewed", value: stats.reviewedApplications },
        { name: "Interviews", value: stats.interviews },
        { name: "Offers", value: stats.offers },
      ]
    : [];

  // Data for applications over time (mock data)
  const applicationTimeData = [
    { name: "Jan", applications: 2 },
    { name: "Feb", applications: 4 },
    { name: "Mar", applications: 3 },
    { name: "Apr", applications: 5 },
    { name: "May", applications: 7 },
    { name: "Jun", applications: 4 },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Seeker Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.username}! Here's your job search activity.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button onClick={() => setActiveTab("search")}>
            <Plus className="mr-1 h-4 w-4" />
            Find Jobs
          </Button>
          <Button variant="outline" onClick={() => setShowResumeUploader(true)}>
            <Upload className="mr-1 h-4 w-4" />
            Upload Resume
          </Button>
        </div>
      </div>

      {showResumeUploader && (
        <ResumeUploader 
          userId={user?.id || ''} 
          onUploadSuccess={handleResumeUpload}
          onCancel={() => setShowResumeUploader(false)}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="resumes">Resumes</TabsTrigger>
          <TabsTrigger value="search">Job Search</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="py-12 text-center">Loading dashboard data...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <CardTitle className="text-lg font-medium">Pending Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.pendingApplications || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Interviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.interviews || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Job Offers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.offers || 0}</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Applications Status</CardTitle>
                    <CardDescription>Breakdown of your application statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={applicationChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {applicationChartData.map((entry, index) => (
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
                    <CardDescription>Your job application activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={applicationTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="applications" fill="#4F46E5" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Your 5 most recent job applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <ApplicationsList 
                    applications={applications.slice(0, 5)} 
                    showPagination={false}
                  />
                  
                  {applications.length > 5 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => setActiveTab("applications")}>
                        View All Applications
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Track the status of your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center">Loading applications...</div>
              ) : (
                <ApplicationsList applications={applications} showPagination={true} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resumes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>My Resumes</CardTitle>
                <CardDescription>Manage your uploaded resumes</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowResumeUploader(true)}>
                <Upload className="mr-1 h-4 w-4" />
                Upload New
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center">Loading resumes...</div>
              ) : resumes.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">You haven't uploaded any resumes yet</p>
                  <p className="text-gray-500 text-sm mb-4">Upload a resume to start applying for jobs</p>
                  <Button onClick={() => setShowResumeUploader(true)}>
                    Upload Resume
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumes.map((resume) => (
                    <div 
                      key={resume.id} 
                      className="flex items-center justify-between border p-4 rounded-md"
                    >
                      <div className="flex items-center">
                        <FileText className="h-6 w-6 text-indigo-600 mr-3" />
                        <div>
                          <div className="font-medium">{resume.title}</div>
                          <div className="text-sm text-gray-500">
                            Uploaded on {new Date(resume.uploadDate).toLocaleDateString()}
                          </div>
                        </div>
                        {resume.isDefault && (
                          <span className="ml-3 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Download</Button>
                        {!resume.isDefault && (
                          <Button variant="outline" size="sm">Set as Default</Button>
                        )}
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="search">
          <JobSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}
