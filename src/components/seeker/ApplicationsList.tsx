
import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Application } from "@/types";

interface ApplicationsListProps {
  applications: Application[];
  showPagination?: boolean;
}

export default function ApplicationsList({ applications, showPagination = true }: ApplicationsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (applications.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">You haven't applied to any jobs yet.</p>
      </div>
    );
  }

  // Get display applications based on pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplications = applications.slice(indexOfFirstItem, indexOfLastItem);
  
  // Total pages
  const totalPages = Math.ceil(applications.length / itemsPerPage);

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
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Applied Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentApplications.map((application) => (
            <TableRow key={application.id}>
              <TableCell className="font-medium">
                {/* In a real implementation, we'd look up the job details */}
                {application.jobId === "1" && "Senior Frontend Developer"}
                {application.jobId === "2" && "Backend Engineer"}
                {application.jobId === "3" && "DevOps Specialist"}
                {application.jobId === "4" && "UX/UI Designer"}
                {application.jobId === "5" && "Data Scientist"}
              </TableCell>
              <TableCell>
                {/* In a real implementation, we'd look up the company name */}
                {(application.jobId === "1" || application.jobId === "2" || application.jobId === "5") && "TechCorp Inc."}
                {application.jobId === "3" && "CloudSystems LLC"}
                {application.jobId === "4" && "DesignHub"}
              </TableCell>
              <TableCell>
                {new Date(application.appliedDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {getStatusBadge(application.status)}
              </TableCell>
              <TableCell className="text-right">
                <a href="#" className="text-indigo-600 hover:text-indigo-800 text-sm">
                  View Details
                </a>
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
    </div>
  );
}
