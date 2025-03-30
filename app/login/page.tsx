"use client";

import { useState, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/organizations";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("[LOGIN] Starting login process");
    console.log("[LOGIN] Email:", email);
    console.log("[LOGIN] Callback URL:", callbackUrl);

    try {
      console.log("[LOGIN] Calling signIn with credentials");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("[LOGIN] Sign in result:", result);

      if (result?.error) {
        console.log("[LOGIN] Error:", result.error);
        setError(result.error);
        toast.error(result.error);
        return;
      }

      if (result?.ok) {
        console.log("[LOGIN] Login successful, redirecting to:", callbackUrl);
        router.push(callbackUrl);
        toast.success("Logged in successfully!");
      } else {
        console.log("[LOGIN] Login failed without error");
        setError("Login failed. Please try again.");
        toast.error("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("[LOGIN] Unexpected error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gray-900">Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-900">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              className="text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-900">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="text-gray-900"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#E55937] hover:bg-[#E55937]/90"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome Back
          </h1>
          <p className="text-xl text-gray-900">
            Sign in to your Bake Sale account
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
} 