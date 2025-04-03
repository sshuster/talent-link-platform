
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, Building2, Lightbulb, Users, Check } from "lucide-react";
import Layout from "@/components/Layout";

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(searchTerm)}`);
  };
  
  // Featured job categories
  const categories = [
    { name: "Technology", count: 234, icon: <Briefcase className="h-6 w-6" /> },
    { name: "Marketing", count: 156, icon: <Lightbulb className="h-6 w-6" /> },
    { name: "Finance", count: 189, icon: <Building2 className="h-6 w-6" /> },
    { name: "Healthcare", count: 278, icon: <Users className="h-6 w-6" /> },
  ];
  
  // Featured jobs
  const featuredJobs = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "New York, NY",
      salary: "$120K - $150K",
      type: "full-time",
    },
    {
      id: "2",
      title: "Backend Engineer",
      company: "TechCorp Inc.",
      location: "Remote",
      salary: "$110K - $140K",
      type: "full-time",
    },
    {
      id: "3",
      title: "DevOps Specialist",
      company: "CloudSystems LLC",
      location: "Seattle, WA",
      salary: "$130K - $160K",
      type: "full-time",
    },
    {
      id: "4",
      title: "UX/UI Designer",
      company: "DesignHub",
      location: "San Francisco, CA",
      salary: "$90K - $120K",
      type: "full-time",
    },
  ];
  
  // How it works steps
  const howItWorks = [
    {
      title: "Create an Account",
      description: "Sign up for free and fill in your profile with your skills and experience",
      icon: <Users className="h-10 w-10 text-indigo-600" />,
    },
    {
      title: "Find Your Job",
      description: "Browse thousands of jobs using our advanced search and filters",
      icon: <Search className="h-10 w-10 text-indigo-600" />,
    },
    {
      title: "Apply with Ease",
      description: "Apply with just a few clicks and track your application status",
      icon: <Check className="h-10 w-10 text-indigo-600" />,
    },
  ];

  return (
    <Layout>
      {/* Hero section */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
              Find Your Dream Job Today
            </h1>
            <p className="text-xl mb-8 text-indigo-100">
              Connect with top employers and discover opportunities that match your skills and aspirations
            </p>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Job title, skills, or company"
                  className="pl-10 bg-white text-gray-800 h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg">
                Search Jobs
              </Button>
            </form>
            
            <div className="mt-8 text-sm text-indigo-100">
              Popular searches: Web Developer, Data Scientist, Product Manager, UI/UX Designer
            </div>
          </div>
        </div>
      </section>

      {/* Categories section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore Job Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse opportunities across various industries and find the perfect role for your skills
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link to={`/jobs?category=${category.name}`} key={index}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-gray-500">{category.count} jobs available</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/jobs">Browse All Categories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured jobs section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Jobs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our latest handpicked opportunities from top employers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <Link to={`/jobs/${job.id}`} key={job.id}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={job.type === "full-time" 
                          ? "bg-blue-50 text-blue-700 border-blue-200" 
                          : "bg-purple-50 text-purple-700 border-purple-200"
                        }
                      >
                        {job.type.replace("-", " ")}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                      <div>{job.location}</div>
                      <div>{job.salary}</div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="link" className="text-indigo-600 hover:text-indigo-800 p-0">
                        View Details →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild>
              <Link to="/jobs">Browse All Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our simple process helps you find and apply for the perfect job in just a few steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Next Opportunity?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-indigo-100">
            Join thousands of professionals who have already found their dream jobs with TalentLink
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-indigo-700" asChild>
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
