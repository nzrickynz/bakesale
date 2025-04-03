import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireOrganizationAccess } from "@/lib/auth";
import { UserRole } from "@prisma/client";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function OrganizationSettingsPage({ params }: PageProps) {
  const userRole = await requireOrganizationAccess(params.id);
  
  // Only allow ORG_ADMIN to access settings
  if (userRole !== UserRole.ORG_ADMIN) {
    notFound();
  }

  const organization = await prisma.organization.findUnique({
    where: { id: params.id },
  });

  if (!organization) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Organization Settings</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900">Organization Name</Label>
                <Input
                  id="name"
                  defaultValue={organization.name}
                  placeholder="Enter organization name"
                  className="text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-900">Description</Label>
                <Textarea
                  id="description"
                  defaultValue={organization.description || ""}
                  placeholder="Enter organization description"
                  className="text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-gray-900">Website</Label>
                <Input
                  id="website"
                  type="url"
                  defaultValue={organization.websiteUrl || ""}
                  placeholder="https://example.com"
                  className="text-gray-900 placeholder-gray-500"
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Social Media</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-gray-900">Facebook URL</Label>
                <Input
                  id="facebook"
                  type="url"
                  defaultValue={organization.facebookUrl || ""}
                  placeholder="https://facebook.com/your-org"
                  className="text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-gray-900">Instagram URL</Label>
                <Input
                  id="instagram"
                  type="url"
                  defaultValue={organization.instagramUrl || ""}
                  placeholder="https://instagram.com/your-org"
                  className="text-gray-900 placeholder-gray-500"
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 