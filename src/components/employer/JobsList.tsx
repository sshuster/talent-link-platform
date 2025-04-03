
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { jobApi } from "@/services/api";
import PostJobForm from "./PostJobForm";

interface JobsListProps {
  jobs: Job[];
  showPagination?: boolean;
  onJobUpdated: (job: Job) => void;
  onJobDeleted: (jobId: string) => void;
}

export default function JobsList({ 
  jobs, 
  showPagination = true,
  onJobUpdated,
  onJobDeleted
}: JobsListProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  if (jobs.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">You haven't posted any jobs yet.</p>
        <p className="text-gray-500 text-sm mt-2">Click on "Post New Job" to get started.</p>
      </div>
    );
  }

  // Get display jobs based on pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = jobs.slice(indexOfFirstItem, indexOfLastItem);
  
  // Total pages
  const totalPages = Math.ceil(jobs.length / itemsPerPage);

  const handleJobUpdate = (updatedJob: Job) => {
    onJobUpdated(updatedJob);
    setEditingJob(null);
  };

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // In a real app, we would call the API
      // await jobApi.deleteJob(jobToDelete.id);
      
      toast({
        title: "Job deleted",
        description: "The job listing has been deleted successfully.",
      });
      
      onJobDeleted(jobToDelete.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      {editingJob && (
        <PostJobForm
          employerId={editingJob.employerId}
          onJobCreated={handleJobUpdate}
          onCancel={() => setEditingJob(null)}
          editJob={editingJob}
        />
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Posted Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applications</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentJobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">
                {job.title}
                <div className="text-sm text-gray-500">
                  {job.company}
                </div>
              </TableCell>
              <TableCell>{job.location}</TableCell>
              <TableCell>{formatDate(job.postedDate)}</TableCell>
              <TableCell>
                <Badge 
                  variant="outline"
                  className={job.status === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                  }
                >
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {/* This would be actual data in a real app */}
                {job.id === "1" ? "4" : 
                 job.id === "2" ? "2" : 
                 job.id === "5" ? "1" : "0"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Job Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      <span>View Listing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => setEditingJob(job)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600" 
                      onClick={() => handleDeleteClick(job)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showPagination && totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the job listing "{jobToDelete?.title}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
