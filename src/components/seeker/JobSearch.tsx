
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Briefcase, Calendar, DollarSign } from "lucide-react";
import { jobApi, resumeApi, applicationApi } from "@/services/api";
import { Job, Resume } from "@/types";

export default function JobSearch() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [isApplying, setIsApplying] = useState(false);
  const [showJobDialog, setShowJobDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const [fetchedJobs, fetchedResumes] = await Promise.all([
          jobApi.getJobs(),
          resumeApi.getUserResumes(user.id)
        ]);
        
        setJobs(fetchedJobs);
        setFilteredJobs(fetchedJobs);
        setResumes(fetchedResumes);
        
        // Set default resume if available
        const defaultResume = fetchedResumes.find(resume => resume.isDefault);
        if (defaultResume) {
          setSelectedResumeId(defaultResume.id);
        } else if (fetchedResumes.length > 0) {
          setSelectedResumeId(fetchedResumes[0].id);
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
        toast({
          title: "Error loading jobs",
          description: "Could not load job listings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);

  // Apply filters whenever search term or job type changes
  useEffect(() => {
    let results = jobs;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(job => 
        job.title.toLowerCase().includes(term) || 
        job.company.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term)
      );
    }
    
    // Apply job type filter
    if (jobTypeFilter) {
      results = results.filter(job => job.jobType === jobTypeFilter);
    }
    
    setFilteredJobs(results);
  }, [searchTerm, jobTypeFilter, jobs]);

  const handleApplyForJob = async (job: Job) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply for jobs.",
        variant: "destructive",
      });
      return;
    }
    
    if (resumes.length === 0) {
      toast({
        title: "Resume required",
        description: "Please upload a resume first before applying.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedJob(job);
    setShowJobDialog(true);
  };

  const handleSubmitApplication = async () => {
    if (!user || !selectedJob || !selectedResumeId) return;
    
    try {
      setIsApplying(true);
      
      // In a real app, this would call the API
      // await applicationApi.applyForJob(selectedJob.id, user.id, selectedResumeId);
      
      toast({
        title: "Application submitted",
        description: `You've successfully applied for ${selectedJob.title} at ${selectedJob.company}`,
      });
      
      setShowJobDialog(false);
      setSelectedJob(null);
    } catch (error) {
      console.error("Error applying for job:", error);
      toast({
        title: "Application failed",
        description: "There was a problem submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Find Jobs</CardTitle>
          <CardDescription>Search and apply for jobs that match your skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by title, company, or keywords"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={jobTypeFilter || "all"}
              onValueChange={(value) => setJobTypeFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="py-12 text-center">Loading jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600">No jobs found matching your criteria.</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="border rounded-lg p-5 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <p className="text-gray-600">{job.company}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {job.jobType.replace("-", " ")}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salary}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Posted {formatDate(job.postedDate)}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        job.jobType === "full-time"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : job.jobType === "part-time"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : job.jobType === "contract"
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      }
                    >
                      {job.jobType.replace("-", " ")}
                    </Badge>
                  </div>
                  
                  <p className="mt-3 text-gray-600 line-clamp-2">{job.description}</p>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <Button
                      variant="link"
                      className="text-indigo-600 hover:text-indigo-800 p-0"
                      onClick={() => {
                        setSelectedJob(job);
                        setShowJobDialog(true);
                      }}
                    >
                      View Details
                    </Button>
                    <Button onClick={() => handleApplyForJob(job)}>
                      Apply Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job details and application dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-3xl">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedJob.title}</DialogTitle>
                <DialogDescription>{selectedJob.company} • {selectedJob.location}</DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-wrap gap-2 my-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {selectedJob.jobType.replace("-", " ")}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {selectedJob.salary}
                </Badge>
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  Posted {formatDate(selectedJob.postedDate)}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Description</h4>
                  <p className="text-gray-700">{selectedJob.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Requirements</h4>
                  <p className="text-gray-700">{selectedJob.requirements}</p>
                </div>
                
                {user && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3">Apply for this position</h4>
                    
                    {resumes.length > 0 ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Resume
                          </label>
                          <Select
                            value={selectedResumeId}
                            onValueChange={setSelectedResumeId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a resume" />
                            </SelectTrigger>
                            <SelectContent>
                              {resumes.map((resume) => (
                                <SelectItem key={resume.id} value={resume.id}>
                                  {resume.title} {resume.isDefault && "(Default)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-gray-600 mb-2">
                          You need to upload a resume before applying.
                        </p>
                        <Button variant="outline">Upload Resume</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowJobDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitApplication} 
                  disabled={isApplying || !selectedResumeId || resumes.length === 0}
                >
                  {isApplying ? "Submitting..." : "Apply Now"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
