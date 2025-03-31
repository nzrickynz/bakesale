"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    const data = {
      // User account details
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: password,
      role: "ORG_ADMIN" as const,
      
      // Organization details
      organizationName: formData.get("organizationName") as string,
      organizationDescription: formData.get("organizationDescription") as string,
      websiteUrl: formData.get("websiteUrl") as string,
      facebookUrl: formData.get("facebookUrl") as string,
      instagramUrl: formData.get("instagramUrl") as string,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      // Redirect to organization dashboard
      router.push("/dashboard/organizations");
      toast.success("Organization registered successfully!");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Register Your Organization
          </h1>
          <p className="text-xl text-gray-800">
            Join Bake Sale and start fundraising for your cause
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Organization Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Organization Name */}
              <div className="space-y-2">
                <Label htmlFor="organizationName" className="text-gray-800">Organization Name</Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  placeholder="Your organization's name"
                  required
                  className="text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="organizationDescription" className="text-gray-800">Description</Label>
                <Textarea
                  id="organizationDescription"
                  name="organizationDescription"
                  placeholder="Tell us about your organization..."
                  className="min-h-[100px] text-gray-800 placeholder-gray-400"
                  required
                />
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <Label className="text-gray-800">Social Media Links</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Link className="w-5 h-5 text-gray-500" />
                    <Input
                      name="facebookUrl"
                      placeholder="Facebook URL"
                      type="url"
                      className="text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Link className="w-5 h-5 text-gray-500" />
                    <Input
                      name="instagramUrl"
                      placeholder="Instagram URL"
                      type="url"
                      className="text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Link className="w-5 h-5 text-gray-500" />
                    <Input
                      name="websiteUrl"
                      placeholder="Website URL"
                      type="url"
                      className="text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Account */}
              <div className="space-y-4">
                <Label className="text-gray-800">Admin Account</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-800">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      className="text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-800">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      className="text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-800">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      className="text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-800">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={8}
                      className="text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1"
                    required
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-800">
                    I agree to the{' '}
                    <a href="/terms" className="text-orange-500 hover:text-orange-600 hover:underline">
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-orange-500 hover:text-orange-600 hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#E55937] hover:bg-[#E55937]/90"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register Organization"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 