import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Shield,
  Crown,
  Sparkles,
  Coins,
  Calendar,
  Mail,
  FileText,
  Trash2,
  UploadCloud,
  Loader2,
  CheckCircle,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  // 🔹 Fetch users
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data?.users) return data.users;
      if (data?.data) return data.data;
      return [];
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: Infinity,
  });

  // 🔹 Fetch files
  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/admin/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data || [];
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: Infinity,
  });

  // 🔹 Upload file
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !user?.id) {
        throw new Error("No file selected or user not authenticated");
      }
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", user.id);

      const response = await axios.post("http://localhost:5000/api/admin/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      // Clear the file input
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Show success feedback
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      
      // Refresh the files list
      queryClient.invalidateQueries(["files"]);
    },
    onError: (error: any) => {
      console.error("Upload failed:", error);
      alert(error?.response?.data?.message || "Failed to upload file");
    },
  });

  // 🔹 Delete file
  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await axios.delete(`http://localhost:5000/api/admin/files/${fileId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["files"]);
    },
    onError: (error: any) => {
      console.error("Delete failed:", error);
      alert(error?.response?.data?.message || "Failed to delete file");
    },
  });

  // 🔹 Filters
  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = planFilter === "all" || u.plan === planFilter;
      return matchesSearch && matchesPlan;
    });
  }, [users, searchTerm, planFilter]);

  // 🔹 Stats
  const stats = useMemo(() => {
    if (users.length === 0)
      return { totalUsers: 0, basicUsers: 0, standardUsers: 0, premiumUsers: 0, totalTokensUsed: 0, averageTokenUsage: 0 };

    return {
      totalUsers: users.length,
      basicUsers: users.filter((u: any) => u.plan === "basic").length,
      standardUsers: users.filter((u: any) => u.plan === "standard").length,
      premiumUsers: users.filter((u: any) => u.plan === "premium").length,
      totalTokensUsed: users.reduce((acc: number, u: any) => acc + (u.maxTokens - u.tokens), 0),
      averageTokenUsage: (users.reduce((acc: number, u: any) => acc + (u.maxTokens - u.tokens) / u.maxTokens, 0) / users.length) * 100,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadSuccess(false); // Reset success state when new file is selected
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }
    uploadMutation.mutate();
  };

  // 🔹 Loading/Error States
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Error loading users. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-muted">
      <Navbar />

      {user?.role !== "admin" ? (
        <div className="container mx-auto px-6 py-12 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      ) : (
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-6 w-6" /> Admin Dashboard
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader><CardTitle>Total Users</CardTitle></CardHeader>
              <CardContent className="text-2xl font-bold">{stats.totalUsers}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Basic</CardTitle></CardHeader>
              <CardContent className="text-2xl font-bold">{stats.basicUsers}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Standard</CardTitle></CardHeader>
              <CardContent className="text-2xl font-bold">{stats.standardUsers}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Premium</CardTitle></CardHeader>
              <CardContent className="text-2xl font-bold">{stats.premiumUsers}</CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative w-full max-w-xs">
              <Input 
                placeholder="Search users..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User List */}
          <ScrollArea className="h-[400px] mb-10">
            {filteredUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users found matching your criteria.</p>
            ) : (
              filteredUsers.map((u: any) => (
                <Card key={u._id} className="mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {u.email}
                      <Badge className={getPlanBadgeStyle(u.plan)}>
                        {getPlanIcon(u.plan)} {u.plan}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Joined {u.createdAt ? formatDate(u.createdAt) : "N/A"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" /> 
                      {u.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" /> 
                      {u.createdAt ? formatDate(u.createdAt) : "N/A"}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </ScrollArea>

          {/* File Management */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6" /> File Management
            </h2>

            {/* Upload Section */}
            <div className="mb-6">
              <div className="flex gap-4 items-center">
                <Input 
                  ref={fileInputRef}
                  type="file" 
                  onChange={handleFileChange}
                  disabled={uploadMutation.isPending}
                  className="max-w-sm"
                />
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || uploadMutation.isPending}
                  variant={uploadSuccess ? "default" : "default"}
                  className="min-w-[120px]"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Uploaded!
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              
              {/* File selection indicator */}
              {selectedFile && !uploadMutation.isPending && !uploadSuccess && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
              
              {/* Success message */}
              {uploadSuccess && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  File uploaded successfully!
                </p>
              )}
            </div>

            {/* File List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {filesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <p>Loading files...</p>
                    </div>
                  ) : files.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No files uploaded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {files.map((file: any) => (
                        <div 
                          key={file._id} 
                          className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <a
                                href={`http://localhost:5000/api/admin/${file._id}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium"
                              >
                                {file.filename}
                              </a>
                              {file.uploadDate && (
                                <p className="text-xs text-muted-foreground">
                                  Uploaded: {formatDate(file.uploadDate)}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${file.filename}?`)) {
                                deleteMutation.mutate(file._id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;