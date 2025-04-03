
import { Job, Application, Resume, User, EmployerStats, SeekerStats } from '@/types';

// Base URL for API
const API_URL = '/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API Error');
  }
  return response.json();
};

// Job APIs
export const jobApi = {
  getJobs: async (): Promise<Job[]> => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return getMockJobs(); // Fallback to mock data
    }
  },

  getJobById: async (id: string): Promise<Job> => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      const mockJobs = getMockJobs();
      const job = mockJobs.find(j => j.id === id);
      if (!job) throw new Error('Job not found');
      return job;
    }
  },

  createJob: async (jobData: Omit<Job, 'id' | 'postedDate'>): Promise<Job> => {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  updateJob: async (id: string, jobData: Partial<Job>): Promise<Job> => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating job ${id}:`, error);
      throw error;
    }
  },

  deleteJob: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error deleting job ${id}:`, error);
      throw error;
    }
  },

  getEmployerJobs: async (employerId: string): Promise<Job[]> => {
    try {
      const response = await fetch(`${API_URL}/employers/${employerId}/jobs`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching employer ${employerId} jobs:`, error);
      // Return filtered mock jobs
      return getMockJobs().filter(job => job.employerId === employerId);
    }
  },
};

// Application APIs
export const applicationApi = {
  getApplications: async (userId: string): Promise<Application[]> => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/applications`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching applications for user ${userId}:`, error);
      return getMockApplications().filter(app => app.userId === userId);
    }
  },

  applyForJob: async (jobId: string, userId: string, resumeId: string): Promise<Application> => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, resumeId }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error applying for job ${jobId}:`, error);
      throw error;
    }
  },

  updateApplicationStatus: async (id: string, status: Application['status']): Promise<Application> => {
    try {
      const response = await fetch(`${API_URL}/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating application ${id}:`, error);
      throw error;
    }
  },

  getJobApplications: async (jobId: string): Promise<Application[]> => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/applications`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching applications for job ${jobId}:`, error);
      return getMockApplications().filter(app => app.jobId === jobId);
    }
  },
};

// Resume APIs
export const resumeApi = {
  getUserResumes: async (userId: string): Promise<Resume[]> => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/resumes`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching resumes for user ${userId}:`, error);
      return getMockResumes().filter(resume => resume.userId === userId);
    }
  },

  uploadResume: async (userId: string, formData: FormData): Promise<Resume> => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/resumes`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  },

  deleteResume: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/resumes/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error deleting resume ${id}:`, error);
      throw error;
    }
  },

  setDefaultResume: async (userId: string, resumeId: string): Promise<Resume> => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/resumes/${resumeId}/default`, {
        method: 'PUT',
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error setting default resume ${resumeId}:`, error);
      throw error;
    }
  },
};

// Stats APIs
export const statsApi = {
  getEmployerStats: async (employerId: string): Promise<EmployerStats> => {
    try {
      const response = await fetch(`${API_URL}/employers/${employerId}/stats`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching stats for employer ${employerId}:`, error);
      return getMockEmployerStats(employerId);
    }
  },

  getSeekerStats: async (userId: string): Promise<SeekerStats> => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/stats`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching stats for user ${userId}:`, error);
      return getMockSeekerStats(userId);
    }
  },
};

// Mock data generators
function getMockJobs(): Job[] {
  return [
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "New York, NY",
      description: "We are looking for an experienced Frontend Developer to join our team.",
      requirements: "5+ years of experience with React, TypeScript, and modern frontend frameworks.",
      salary: "$120,000 - $150,000",
      jobType: "full-time",
      postedDate: "2023-06-15T00:00:00Z",
      employerId: "2", // mvc user
      status: "active"
    },
    {
      id: "2",
      title: "Backend Engineer",
      company: "TechCorp Inc.",
      location: "Remote",
      description: "Join our backend team to build scalable APIs and services.",
      requirements: "Experience with Node.js, Python, and database design.",
      salary: "$110,000 - $140,000",
      jobType: "full-time",
      postedDate: "2023-06-10T00:00:00Z",
      employerId: "2", // mvc user
      status: "active"
    },
    {
      id: "3",
      title: "DevOps Specialist",
      company: "CloudSystems LLC",
      location: "Seattle, WA",
      description: "Help us build and maintain our cloud infrastructure.",
      requirements: "Experience with AWS, Docker, Kubernetes, and CI/CD pipelines.",
      salary: "$130,000 - $160,000",
      jobType: "full-time",
      postedDate: "2023-06-05T00:00:00Z",
      employerId: "3", // other employer
      status: "active"
    },
    {
      id: "4",
      title: "UX/UI Designer",
      company: "DesignHub",
      location: "San Francisco, CA",
      description: "Create beautiful and intuitive user interfaces for our products.",
      requirements: "Portfolio showcasing UX/UI work, experience with Figma and Adobe Suite.",
      salary: "$90,000 - $120,000",
      jobType: "full-time",
      postedDate: "2023-06-01T00:00:00Z",
      employerId: "3", // other employer
      status: "active"
    },
    {
      id: "5",
      title: "Data Scientist",
      company: "TechCorp Inc.",
      location: "Boston, MA",
      description: "Analyze large datasets and build predictive models.",
      requirements: "Experience with Python, R, and machine learning frameworks.",
      salary: "$125,000 - $155,000",
      jobType: "full-time",
      postedDate: "2023-05-28T00:00:00Z",
      employerId: "2", // mvc user
      status: "active"
    }
  ];
}

function getMockApplications(): Application[] {
  return [
    {
      id: "1",
      jobId: "1",
      userId: "1", // muser
      resumeId: "1",
      status: "reviewed",
      appliedDate: "2023-06-16T00:00:00Z",
      notes: "Strong candidate, schedule interview"
    },
    {
      id: "2",
      jobId: "2",
      userId: "1", // muser
      resumeId: "1",
      status: "pending",
      appliedDate: "2023-06-17T00:00:00Z"
    },
    {
      id: "3",
      jobId: "5",
      userId: "1", // muser
      resumeId: "2",
      status: "interviewed",
      appliedDate: "2023-06-10T00:00:00Z",
      notes: "Great interview, considering offer"
    },
    {
      id: "4",
      jobId: "3",
      userId: "1", // muser
      resumeId: "1",
      status: "rejected",
      appliedDate: "2023-05-30T00:00:00Z",
      notes: "Not enough experience with required technologies"
    },
    {
      id: "5",
      jobId: "5",
      userId: "3", // another job seeker
      resumeId: "3",
      status: "pending",
      appliedDate: "2023-06-15T00:00:00Z"
    }
  ];
}

function getMockResumes(): Resume[] {
  return [
    {
      id: "1",
      userId: "1", // muser
      title: "Software Developer Resume",
      fileName: "resume_software_dev.pdf",
      uploadDate: "2023-05-15T00:00:00Z",
      isDefault: true
    },
    {
      id: "2",
      userId: "1", // muser
      title: "Data Science Resume",
      fileName: "resume_data_science.pdf",
      uploadDate: "2023-05-20T00:00:00Z",
      isDefault: false
    },
    {
      id: "3",
      userId: "3", // another job seeker
      title: "Frontend Developer Resume",
      fileName: "resume_frontend.pdf",
      uploadDate: "2023-06-01T00:00:00Z",
      isDefault: true
    }
  ];
}

function getMockEmployerStats(employerId: string): EmployerStats {
  // Here we'd normally filter based on the employer ID
  return {
    totalJobs: 3,
    activeJobs: 3,
    totalApplications: 4,
    reviewedApplications: 2,
    interviewedCandidates: 1
  };
}

function getMockSeekerStats(userId: string): SeekerStats {
  // Here we'd normally filter based on the user ID
  return {
    totalApplications: 4,
    pendingApplications: 1,
    reviewedApplications: 1,
    interviews: 1,
    offers: 0
  };
}
