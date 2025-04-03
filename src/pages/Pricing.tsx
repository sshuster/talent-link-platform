
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";

const pricingPlans = [
  {
    name: "Basic",
    price: 0,
    duration: "Free",
    description: "Everything you need to get started",
    features: [
      "Post 1 job at a time",
      "Basic company profile",
      "7-day job listings",
      "Email support",
    ],
    buttonText: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: 99,
    duration: "per month",
    description: "Perfect for growing businesses",
    features: [
      "Post 5 jobs at a time",
      "Enhanced company profile",
      "30-day job listings",
      "Priority email support",
      "Resume database access (limited)",
      "Basic analytics",
    ],
    buttonText: "Subscribe to Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 299,
    duration: "per month",
    description: "For larger organizations with advanced needs",
    features: [
      "Unlimited job postings",
      "Premium company profile",
      "60-day job listings",
      "Dedicated account manager",
      "Unlimited resume database access",
      "Advanced analytics and reporting",
      "Featured job listings",
      "API access",
    ],
    buttonText: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planName: string) => {
    if (!isAuthenticated) {
      navigate("/register");
      return;
    }

    // If user is a job seeker, they can't purchase plans
    if (user?.userType === "seeker") {
      navigate("/dashboard");
      return;
    }

    setSelectedPlan(planName);
    
    // In a real app, you'd redirect to checkout or subscription page
    if (planName === "Enterprise") {
      window.open("mailto:sales@talentlink.example.com");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your hiring needs.
            No hidden fees or long-term commitments.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-indigo-600 shadow-lg shadow-indigo-100"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <div className="bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 ml-1">/{plan.duration}</span>
                </div>
                
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="ml-3 text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.popular ? "bg-indigo-600 hover:bg-indigo-700" : ""
                  }`}
                  onClick={() => handleSelectPlan(plan.name)}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">
            Need a custom solution?
          </h2>
          <p className="text-gray-600 mb-6">
            Contact our sales team to create a tailored package for your organization's specific needs.
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </div>
      </div>
    </Layout>
  );
}
