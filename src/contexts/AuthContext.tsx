
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { User } from '@/types';

// Mock users for testing frontend without backend
const MOCK_USERS = [
  {
    id: "1",
    username: "muser",
    password: "muser",
    email: "muser@example.com",
    userType: "seeker",
    createdAt: "2023-01-15T00:00:00Z"
  },
  {
    id: "2",
    username: "mvc",
    password: "mvc",
    email: "mvc@example.com",
    userType: "employer",
    createdAt: "2023-01-20T00:00:00Z"
  }
];

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, userType: 'seeker' | 'employer') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock login function - will be replaced with real API call
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For mock testing, check against our mock users
      const foundUser = MOCK_USERS.find(
        u => u.username === username && u.password === password
      );
      
      if (foundUser) {
        // Strip password before storing
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword as User);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        toast({
          title: "Login successful",
          description: `Welcome back, ${username}!`,
        });
        return true;
      } else {
        // Try real backend if mock user not found
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          toast({
            title: "Login successful",
            description: `Welcome back, ${username}!`,
          });
          return true;
        } else {
          toast({
            title: "Login failed",
            description: "Invalid username or password",
            variant: "destructive",
          });
          return false;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock register function - will be replaced with real API call
  const register = async (username: string, email: string, password: string, userType: 'seeker' | 'employer') => {
    setIsLoading(true);
    
    try {
      // This will try to use the backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, userType }),
      });
      
      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. Please log in.",
        });
        return true;
      } else {
        const data = await response.json();
        toast({
          title: "Registration failed",
          description: data.message || "Failed to register account",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration error",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
