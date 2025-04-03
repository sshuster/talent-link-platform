
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Application, Job } from "@/types";
import { applicationApi, jobApi } from "@/services/api";
import { Download, Eye, UserCheck, UserX, MessageSquare } from "lucide-react";

interface ApplicationsManagerProps {
  employerId: string;
  jobs: Job[];
}

export default function ApplicationsManager({ employerId, jobs }: ApplicationsManagerProps) {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<Application['status']>("pending");
  const [noteText, setNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!selectedJobId) return;
      
      try {
        setIsLoading(true);
        const jobApplications = await applicationApi.getJobApplications(selectedJobId);
        setApplications(jobApplications);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast({
          title: "Error loading applications",
          description: "Could not load applications. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
  }, [selectedJobId, toast]);

  const handleChangeStatus = (application: Application) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setIsChangeStatusOpen(true);
  };

  const handleAddNote = (application: Application) => {
    setSelectedApplication(application);
    setNoteText(application.notes || "");
    setIsAddNoteOpen(true);
  };

  const submitStatusChange = async () => {
    if (!selectedApplication) return;
    
    try {
      setIsUpdatingStatus(true);
      
      // In a real app, this would call the API
      // await applicationApi.updateApplicationStatus(selectedApplication.id, newStatus);
      
      // Update local state
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: newStatus } 
          : app
      );
      
      setApplications(updatedApplications);
      
      toast({
        title: "Status updated",
        description: "The application status has been updated successfully.",
      });
      
      setIsChangeStatusOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "There was an error updating the status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const submitNote = async () => {
    if (!selectedApplication) return;
    
    try {
      setIsAddingNote(true);
      
      // In a real app, this would call the API
      // await applicationApi.updateApplicationNotes(selectedApplication.id, noteText);
      
      // Update local state
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, notes: noteText } 
          : app
      );
      
      setApplications(updatedApplications);
      
      toast({
        title: "Note added",
        description: "Your note has been saved successfully.",
      });
      
      setIsAddNoteOpen(false);
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "There was an error saving your note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  // Get status badge variant based on application status
  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Reviewed</Badge>;
      case 'interviewed':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Interviewed</Badge>;
      case 'offered':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Offered</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Applications</CardTitle>
        <CardDescription>Review and manage applications for your job listings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Select
            value={selectedJobId}
            onValueChange={setSelectedJobId}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">No applications for this job yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    {/* In a real implementation, we'd look up the user details */}
                    {application.userId === "1" ? "John Doe (muser)" : 
                     application.userId === "3" ? "Jane Smith" : 
                     "Unknown User"}
                  </TableCell>
                  <TableCell>
                    {new Date(application.appliedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Download className="mr-1 h-4 w-4" />
                      Resume
                    </Button>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(application.status)}
                  </TableCell>
                  <TableCell>
                    {application.notes ? (
                      <span className="text-sm text-gray-600 line-clamp-1">
                        {application.notes}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No notes</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleChangeStatus(application)}
                      >
                        <UserCheck className="mr-1 h-4 w-4" />
                        Status
                      </Button>
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddNote(application)}
                      >
                        <MessageSquare className="mr-1 h-4 w-4" />
                        Note
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Change status dialog */}
      <Dialog open={isChangeStatusOpen} onOpenChange={setIsChangeStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Application Status</DialogTitle>
            <DialogDescription>
              Update the status for the application from{" "}
              {selectedApplication?.userId === "1" ? "John Doe (muser)" :
               selectedApplication?.userId === "3" ? "Jane Smith" :
               "Unknown User"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select
              value={newStatus}
              onValueChange={(value) => setNewStatus(value as Application['status'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline" 
              onClick={() => setIsChangeStatusOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitStatusChange}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add note dialog */}
      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note about this application for your reference
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea 
              placeholder="Enter your notes here..." 
              value={noteText} 
              onChange={(e) => setNoteText(e.target.value)}
              rows={6}
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline" 
              onClick={() => setIsAddNoteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitNote}
              disabled={isAddingNote}
            >
              {isAddingNote ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
