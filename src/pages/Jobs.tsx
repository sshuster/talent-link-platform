
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Briefcase, Calendar, DollarSign } from "lucide-react";
import { jobApi } from "@/services/api";
import { Job } from "@/types";
import Layout from "@/components/Layout";

export default function Jobs() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [jobTypeFilter, setJobTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const allJobs = await jobApi.getJobs();
        setJobs(allJobs);
        setFilteredJobs(allJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast({
          title: "Error loading jobs",
          description: "Could not load job listings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobs();
  }, [toast]);

  // Apply filters whenever search term or filters change
  useEffect(() => {
    let results = jobs;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(job => 
        job.title.toLowerCase().includes(term) || 
        job.company.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term)
      );
    }
    
    // Apply location filter
    if (locationFilter) {
      results = results.filter(job => 
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    // Apply job type filter
    if (jobTypeFilter) {
      results = results.filter(job => job.jobType === jobTypeFilter);
    }
    
    setFilteredJobs(results);
  }, [searchTerm, locationFilter, jobTypeFilter, jobs]);

  // Get unique locations for filter
  const locations = [...new Set(jobs.map(job => job.location))];

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
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Find Your Perfect Job
          </h1>
          <p className="text-xl text-gray-600">
            Browse through our curated list of opportunities and take the next step in your career
          </p>
        </div>

        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Job title or keyword"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select
              value={locationFilter || "all"}
              onValueChange={(value) => setLocationFilter(value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={jobTypeFilter || "all"}
              onValueChange={(value) => setJobTypeFilter(value === "all" ? null : value)}
            >
              <SelectTrigger>
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
        </div>

        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-xl text-gray-600">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xl text-gray-600">No jobs found matching your criteria.</p>
              <p className="text-gray-500 mt-2">Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600">Found {filteredJobs.length} jobs</p>
              
              {filteredJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
                      <p className="text-gray-600 mt-1">{job.company}</p>
                      
                      <div className="flex flex-wrap gap-3 mt-3">
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {job.jobType.replace("-", " ")}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salary}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Posted {formatDate(job.postedDate)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:text-right">
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
                  </div>
                  
                  <p className="mt-4 text-gray-600 line-clamp-2">{job.description}</p>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <Button variant="link" className="text-indigo-600 hover:text-indigo-800 p-0">
                      View Details
                    </Button>
                    <Button>Apply Now</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
