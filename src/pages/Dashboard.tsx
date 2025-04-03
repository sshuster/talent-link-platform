
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import SeekerDashboard from "@/components/seeker/SeekerDashboard";
import EmployerDashboard from "@/components/employer/EmployerDashboard";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect due to useEffect
  }

  return (
    <Layout>
      {user.userType === "seeker" ? (
        <SeekerDashboard />
      ) : (
        <EmployerDashboard />
      )}
    </Layout>
  );
}
