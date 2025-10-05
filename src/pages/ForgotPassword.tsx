import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Reset emailSent after cooldown finishes
      setEmailSent(false);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Request failed");

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });

      // Clear field, start cooldown, and show success message
      setEmail("");
      setCooldown(60);
      setEmailSent(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send reset email.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-muted px-4">
      <Card className="max-w-md w-full shadow-soft">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || cooldown > 0}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || cooldown > 0}>
              {loading
                ? "Sending..."
                : cooldown > 0
                ? `Please wait ${cooldown}s`
                : "Send Reset Link"}
            </Button>

            {emailSent && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                ✅ Email has been sent to your account.<br />
                You can send another request after{" "}
                <span className="font-medium">{cooldown}s</span>.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
