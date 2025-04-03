
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { jobApi } from "@/services/api";
import { Job } from "@/types";

interface PostJobFormProps {
  employerId: string;
  onJobCreated: (job: Job) => void;
  onCancel: () => void;
  editJob?: Job; // For editing an existing job
}

export default function PostJobForm({ employerId, onJobCreated, onCancel, editJob }: PostJobFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form state from editJob or with defaults
  const [formState, setFormState] = useState({
    title: editJob?.title || "",
    company: editJob?.company || "TechCorp Inc.", // Default for demo
    location: editJob?.location || "",
    description: editJob?.description || "",
    requirements: editJob?.requirements || "",
    salary: editJob?.salary || "",
    jobType: editJob?.jobType || "full-time",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    for (const [key, value] of Object.entries(formState)) {
      if (!value) {
        toast({
          title: "Validation Error",
          description: `Please enter a value for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      if (editJob) {
        // Update existing job
        // In a real app, we would call the API here
        // const updatedJob = await jobApi.updateJob(editJob.id, formState);
        
        // Mock response for demonstration
        const updatedJob: Job = {
          ...editJob,
          ...formState,
        };
        
        onJobCreated(updatedJob);
        toast({
          title: "Job updated",
          description: "Your job listing has been updated successfully.",
        });
      } else {
        // Create new job
        // In a real app, we would call the API here
        // const newJob = await jobApi.createJob({
        //   ...formState,
        //   employerId
        // });
        
        // Mock response for demonstration
        const newJob: Job = {
          id: Date.now().toString(),
          ...formState,
          jobType: formState.jobType as 'full-time' | 'part-time' | 'contract' | 'remote',
          postedDate: new Date().toISOString(),
          employerId,
          status: 'active'
        };
        
        onJobCreated(newJob);
        toast({
          title: "Job posted",
          description: "Your job listing has been published successfully.",
        });
      }
    } catch (error) {
      console.error("Error posting job:", error);
      toast({
        title: "Error",
        description: "There was an error posting your job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{editJob ? 'Edit Job Listing' : 'Post a New Job'}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title*</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Senior Frontend Developer"
                value={formState.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company*</Label>
              <Input
                id="company"
                name="company"
                placeholder="e.g., TechCorp Inc."
                value={formState.company}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location*</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., New York, NY or Remote"
                value={formState.location}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type*</Label>
              <Select 
                defaultValue={formState.jobType}
                onValueChange={(value) => handleSelectChange('jobType', value)}
              >
                <SelectTrigger id="jobType">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="salary">Salary Range*</Label>
            <Input
              id="salary"
              name="salary"
              placeholder="e.g., $80,000 - $100,000"
              value={formState.salary}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Job Description*</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the role, responsibilities, and benefits..."
              rows={4}
              value={formState.description}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements*</Label>
            <Textarea
              id="requirements"
              name="requirements"
              placeholder="List required skills, experience, education..."
              rows={4}
              value={formState.requirements}
              onChange={handleInputChange}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 
              (editJob ? "Updating..." : "Posting...") : 
              (editJob ? "Update Job" : "Post Job")
            }
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
