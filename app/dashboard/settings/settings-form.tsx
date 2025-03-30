"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Organization, UserOrganization } from "@prisma/client";

type UserWithOrgs = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  adminOf: (UserOrganization & {
    organization: Organization;
  })[];
};

interface SettingsFormProps {
  user: UserWithOrgs;
  causes: any[];
}

export function SettingsForm({ user, causes }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                className="w-full text-gray-900"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="col-span-3 bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Role</h4>
              <p className="text-sm text-gray-600 capitalize">
                {user.role.toLowerCase()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Member Since</h4>
              <p className="text-sm text-gray-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Last Updated</h4>
              <p className="text-sm text-gray-600">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 