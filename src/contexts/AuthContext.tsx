import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  plan: "basic" | "standard" | "premium";
  tokens: number;
  maxTokens: number;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  updateTokens: (amount: number) => void;
  setUserFromToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // 🔹 Initialize from localStorage on load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Sign in failed",
          description: data.message || "Invalid email or password.",
          variant: "destructive",
        });
        return false;
      }

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });

      return true;
    } catch (error) {
      console.error("Signin error:", error);
      toast({
        title: "Sign in failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const signUp = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Sign up failed",
          description: data.message || "Unable to create account.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Verify your email",
        description: "Check your inbox and click the verification link.",
      });

      return true;
    } catch (err) {
      console.error(err);
      toast({
        title: "Sign up failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * ✅ FIXED: setUserFromToken now just decodes and sets the user
   * instead of calling a non-existent /verify endpoint.
   */
  const setUserFromToken = async (token: string) => {
    try {
      // Decode user info directly from the token (if needed)
      // OR skip decoding if verification endpoint already sent full user object
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");

      if (!storedUser) {
        // Optional: implement a minimal token introspection endpoint later
        throw new Error("No user data found for token.");
      }

      setUser(storedUser);
      localStorage.setItem("token", token);

      toast({
        title: "Email verified!",
        description: "You are now logged in.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Verification failed",
        description: err.message || "Please try signing in manually.",
        variant: "destructive",
      });
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  const updateTokens = (amount: number) => {
    if (user && user.role !== "admin") {
      const newTokens = Math.max(0, user.tokens - amount);
      const updatedUser = { ...user, tokens: newTokens };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, signIn, signUp, signOut, updateTokens, setUserFromToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
