import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  Crown,
  Sparkles,
  Coins,
  Calendar,
  Mail,
  Shield,
  BarChart3,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");

  // 🔹 Redirect if not admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface to-muted">
        <Navbar />
        <div className="container mx-auto px-6 py-12 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  // 🔹 Fetch users from API
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data; // expect array of users from backend
    },
  });

  // 🔹 Filters
  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = planFilter === "all" || u.plan === planFilter;
      return matchesSearch && matchesPlan;
    });
  }, [users, searchTerm, planFilter]);

  // 🔹 Stats
  const stats = useMemo(() => {
    if (users.length === 0) return { totalUsers: 0, basicUsers: 0, standardUsers: 0, premiumUsers: 0, totalTokensUsed: 0, averageTokenUsage: 0 };

    return {
      totalUsers: users.length,
      basicUsers: users.filter((u: any) => u.plan === "basic").length,
      standardUsers: users.filter((u: any) => u.plan === "standard").length,
      premiumUsers: users.filter((u: any) => u.plan === "premium").length,
      totalTokensUsed: users.reduce((acc: number, u: any) => acc + (u.maxTokens - u.tokens), 0),
      averageTokenUsage:
        (users.reduce((acc: number, u: any) => acc + (u.maxTokens - u.tokens) / u.maxTokens, 0) / users.length) * 100,
    };
  }, [users]);

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "premium":
        return <Crown className="h-4 w-4 text-accent" />;
      case "standard":
        return <Sparkles className="h-4 w-4 text-primary" />;
      default:
        return <Coins className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPlanBadgeStyle = (plan: string) => {
    switch (plan) {
      case "premium":
        return "bg-accent/10 text-accent border-accent/20";
      case "standard":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Error loading users</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-muted">
      <Navbar />

      {/* The rest of your UI stays the same, just swap mockUsers → filteredUsers */}
    </div>
  );
};

export default AdminDashboard;
