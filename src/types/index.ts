
export interface User {
  id: string;
  username: string;
  email: string;
  userType: 'seeker' | 'employer';
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'remote';
  postedDate: string;
  employerId: string;
  status: 'active' | 'closed';
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  uploadDate: string;
  isDefault: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  resumeId: string;
  status: 'pending' | 'reviewed' | 'interviewed' | 'offered' | 'rejected';
  appliedDate: string;
  notes?: string;
}

export interface EmployerStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  reviewedApplications: number;
  interviewedCandidates: number;
}

export interface SeekerStats {
  totalApplications: number;
  pendingApplications: number;
  reviewedApplications: number;
  interviews: number;
  offers: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
}
